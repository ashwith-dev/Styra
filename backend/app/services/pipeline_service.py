"""PipelineService: orchestrates validation → segmentation → extraction → storage.

Each stage is timed independently.  Failure at any stage stops execution
immediately and returns a structured ``PipelineResult`` with the failing
stage name, error message, and partial metrics.

CPU-bound and blocking I/O stages (validation, segmentation, storage
uploads) run in worker threads via ``asyncio.to_thread`` so the event loop
stays responsive. Validation runs before anything is uploaded, and any
uploads are removed again when a later stage fails, so invalid or
unprocessable images never linger in storage.
"""

import asyncio
import logging
import time
import uuid
from dataclasses import dataclass, field
from typing import Optional

from app.models.pipeline import StageMetrics
from app.services.extraction.base import BaseAttributeExtractor
from app.services.extraction.base_attributes import AIPipelineResult
from app.services.segmentation.base import BaseSegmenter
from app.services.storage_service import StorageService
from app.services.validation.image_validator import ImageValidator

logger = logging.getLogger(__name__)


@dataclass
class PipelineResult:
    pipeline_token: str
    original_image_path: str = ""
    original_image_url: str = ""
    segmented_image_url: str = ""
    thumbnail_url: Optional[str] = None
    attributes: Optional[AIPipelineResult] = None
    metrics: list[StageMetrics] = field(default_factory=list)
    status: str = "completed"  # "completed" | "failed"
    stage_failed: Optional[str] = None
    error_message: Optional[str] = None


class PipelineService:
    """Orchestrate validation → segmentation → extraction → storage.

    Each stage is timed and failures are granular per stage.
    """

    def __init__(
        self,
        validator: ImageValidator,
        segmenter: BaseSegmenter,
        extractor: BaseAttributeExtractor,
        storage: StorageService,
    ) -> None:
        self._validator = validator
        self._segmenter = segmenter
        self._extractor = extractor
        self._storage = storage

    async def warmup(self) -> None:
        """Preload the segmentation model at startup. Non-fatal on failure:
        the first request will pay the model-load cost instead."""
        try:
            await asyncio.to_thread(self._segmenter.warmup)
        except Exception:
            logger.warning(
                "Segmenter warmup failed; model will load on first request",
                exc_info=True,
            )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    async def run(self, image_bytes: bytes) -> PipelineResult:
        token = uuid.uuid4().hex
        metrics: list[StageMetrics] = []
        original_path = ""
        original_url = ""
        segmented_url = ""
        thumbnail_url: Optional[str] = None
        attributes: Optional[AIPipelineResult] = None
        uploaded: list[str] = []

        # ── 1. Validation stage ────────────────────────────────────
        logger.info(
            "Pipeline [%s]: starting validation (%d bytes)", token, len(image_bytes)
        )
        t0 = time.perf_counter()
        try:
            passed, reasons = await asyncio.to_thread(
                self._validator.validate, image_bytes
            )
        except Exception as exc:
            dt = (time.perf_counter() - t0) * 1000
            logger.warning(
                "Pipeline [%s]: validation failed (%.0fms): %s", token, dt, exc
            )
            metrics.append(
                StageMetrics(
                    stage="validation",
                    status="failed",
                    duration_ms=dt,
                    error=str(exc),
                )
            )
            return PipelineResult(
                pipeline_token=token,
                status="failed",
                stage_failed="validation",
                error_message=str(exc),
                metrics=metrics,
            )
        dt = (time.perf_counter() - t0) * 1000

        if not passed:
            metrics.append(
                StageMetrics(
                    stage="validation",
                    status="failed",
                    duration_ms=dt,
                    error="; ".join(reasons),
                )
            )
            return PipelineResult(
                pipeline_token=token,
                status="failed",
                stage_failed="validation",
                error_message="; ".join(reasons),
                metrics=metrics,
            )

        metrics.append(
            StageMetrics(stage="validation", status="success", duration_ms=dt)
        )
        logger.info(
            "Pipeline [%s]: validation passed (%.0fms), starting segmentation",
            token,
            dt,
        )

        # ── 2. Segmentation stage ──────────────────────────────────
        t0 = time.perf_counter()
        try:
            seg_result = await asyncio.to_thread(
                self._segmenter.segment, image_bytes
            )
            dt = (time.perf_counter() - t0) * 1000
            metrics.append(
                StageMetrics(
                    stage="segmentation", status="success", duration_ms=dt
                )
            )
            logger.info(
                "Pipeline [%s]: segmentation complete (%.0fms), uploading to storage",
                token,
                dt,
            )
        except Exception as exc:
            dt = (time.perf_counter() - t0) * 1000
            logger.warning(
                "Pipeline [%s]: segmentation failed (%.0fms): %s", token, dt, exc
            )
            metrics.append(
                StageMetrics(
                    stage="segmentation",
                    status="failed",
                    duration_ms=dt,
                    error=str(exc),
                )
            )
            return PipelineResult(
                pipeline_token=token,
                status="failed",
                stage_failed="segmentation",
                error_message=str(exc),
                metrics=metrics,
            )

        # ── 3. Upload original + segmented + thumbnail ──────────────
        logger.info(
            "Pipeline [%s]: starting storage uploads", token
        )
        t0 = time.perf_counter()
        try:
            original = await asyncio.to_thread(
                self._storage.upload_original, image_bytes
            )
            uploaded.append(original.path)
            original_path = original.path
            original_url = original.public_url

            seg_stored = await asyncio.to_thread(
                self._storage.upload_segmented, seg_result.segmented_bytes
            )
            uploaded.append(seg_stored.path)
            segmented_url = seg_stored.public_url

            try:
                thumb = await asyncio.to_thread(
                    self._storage.upload_thumbnail, seg_result.segmented_bytes
                )
                thumbnail_url = thumb.public_url
                uploaded.append(thumb.path)
            except Exception:
                logger.warning("Thumbnail generation failed", exc_info=True)
                thumbnail_url = None  # non-fatal

            dt = (time.perf_counter() - t0) * 1000
            metrics.append(
                StageMetrics(stage="storage", status="success", duration_ms=dt)
            )
            logger.info(
                "Pipeline [%s]: storage complete (%.0fms), starting extraction",
                token,
                dt,
            )
        except Exception as exc:
            dt = (time.perf_counter() - t0) * 1000
            logger.warning(
                "Pipeline [%s]: storage failed (%.0fms): %s", token, dt, exc
            )
            metrics.append(
                StageMetrics(
                    stage="storage",
                    status="failed",
                    duration_ms=dt,
                    error=str(exc),
                )
            )
            await self._cleanup(uploaded)
            return PipelineResult(
                pipeline_token=token,
                status="failed",
                stage_failed="storage",
                error_message=str(exc),
                metrics=metrics,
            )

        # ── 4. Extraction stage (already async) ────────────────────
        logger.info("Pipeline [%s]: starting extraction", token)
        t0 = time.perf_counter()
        try:
            attributes = await self._extractor.extract(
                seg_result.segmented_bytes
            )
            dt = (time.perf_counter() - t0) * 1000
            metrics.append(
                StageMetrics(
                    stage="extraction", status="success", duration_ms=dt
                )
            )
            logger.info(
                "Pipeline [%s]: extraction complete (%.0fms), pipeline done",
                token,
                dt,
            )
        except Exception as exc:
            dt = (time.perf_counter() - t0) * 1000
            logger.warning(
                "Pipeline [%s]: extraction failed (%.0fms): %s", token, dt, exc
            )
            metrics.append(
                StageMetrics(
                    stage="extraction",
                    status="failed",
                    duration_ms=dt,
                    error=str(exc),
                )
            )
            await self._cleanup(uploaded)
            return PipelineResult(
                pipeline_token=token,
                status="failed",
                stage_failed="extraction",
                error_message=str(exc),
                metrics=metrics,
            )

        return PipelineResult(
            pipeline_token=token,
            original_image_path=original_path,
            original_image_url=original_url,
            segmented_image_url=segmented_url,
            thumbnail_url=thumbnail_url,
            attributes=attributes,
            metrics=metrics,
            status="completed",
        )

    async def _cleanup(self, paths: list[str]) -> None:
        """Best-effort removal of uploads orphaned by a failed stage."""
        for path in paths:
            try:
                await asyncio.to_thread(self._storage.delete, path)
            except Exception:
                logger.warning(
                    "Failed to delete orphaned upload %s", path, exc_info=True
                )
