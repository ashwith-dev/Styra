"""Garment segmentation using briaai/RMBG-1.4 via HuggingFace transformers with PIL fallback.

Produces a transparent-PNG output with the garment isolated on an alpha channel.
If RMBG model inference is unavailable or fails to load, gracefully falls back to a PIL-based
threshold segmenter to guarantee pipeline availability.
"""

import io
import logging

from PIL import Image, ImageChops

from app.services.segmentation.base import BaseSegmenter, SegmentationResult

logger = logging.getLogger(__name__)

_MODEL_NAME = "briaai/RMBG-1.4"


class SegmentedImageTooSmallError(Exception):
    """Raised when the mask is so small it would produce a degraded result."""


class RMBGSegmenter(BaseSegmenter):
    """Segmenter using briaai/RMBG-1.4 with fallback."""

    MIN_MASK_DIMENSION = 4  # pixels; guards against degenerate model output

    def __init__(self) -> None:
        self._pipe = None  # lazy-loaded to avoid importing transformers at module level

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def segment(self, image_bytes: bytes) -> SegmentationResult:
        """Run segmentation and return a transparent-PNG + mask bytes."""
        pil_image = self._open_image(image_bytes)

        try:
            outputs = self._run_model(pil_image)
            best = self._pick_best_mask(outputs)
            self._validate_mask_size(best)
            mask = self._normalize_mask(best, pil_image.size)
            segmented = self._apply_alpha(pil_image, mask)

            seg_bytes = self._encode_png(segmented)
            mask_bytes = self._encode_png(mask)

            return SegmentationResult(
                segmented_bytes=seg_bytes,
                mask_bytes=mask_bytes,
                model_name=_MODEL_NAME,
            )
        except (RuntimeError, ImportError, OSError) as exc:
            logger.warning(
                "RMBG segmentation model failed or unavailable (%s). Using threshold fallback.",
                exc,
            )
            return self._fallback_segment(pil_image)

    # ------------------------------------------------------------------
    # Fallback Segmenter
    # ------------------------------------------------------------------
    def _fallback_segment(self, pil_image: Image.Image) -> SegmentationResult:
        """PIL-based threshold segmenter isolating central clothing object from background."""
        gray = pil_image.convert("L")

        corner_colors = [
            gray.getpixel((0, 0)),
            gray.getpixel((gray.width - 1, 0)),
            gray.getpixel((0, gray.height - 1)),
            gray.getpixel((gray.width - 1, gray.height - 1)),
        ]
        bg_color = sum(corner_colors) // len(corner_colors)

        bg_img = Image.new("L", gray.size, bg_color)
        diff = ImageChops.difference(gray, bg_img)

        threshold = 20
        mask = diff.point(lambda p: 255 if p > threshold else 0).convert("L")

        segmented = self._apply_alpha(pil_image, mask)

        seg_bytes = self._encode_png(segmented)
        mask_bytes = self._encode_png(mask)

        return SegmentationResult(
            segmented_bytes=seg_bytes,
            mask_bytes=mask_bytes,
            model_name="PIL-Threshold-Fallback",
        )

    # ------------------------------------------------------------------
    # Internal steps
    # ------------------------------------------------------------------
    def _open_image(self, image_bytes: bytes) -> Image.Image:
        try:
            return Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as exc:
            raise ValueError(f"Cannot decode input image: {exc}") from exc

    def _run_model(self, pil_image: Image.Image) -> list[dict]:
        try:
            self._lazy_load()
            outputs = self._pipe(pil_image)
        except (ImportError, OSError) as exc:
            raise RuntimeError(f"Segmentation model unavailable: {exc}") from exc
        except Exception as exc:
            if isinstance(exc, (TypeError, ValueError)):
                raise exc
            raise RuntimeError(f"Segmentation model inference failed: {exc}") from exc

        if not isinstance(outputs, list):
            raise TypeError(
                f"Expected list output from model, got {type(outputs).__name__}"
            )
        if not outputs:
            raise ValueError("Segmentation model returned no output")
        return outputs

    def _pick_best_mask(self, outputs: list[dict]) -> Image.Image:
        if not outputs:
            raise ValueError("Segmentation produced no masks")

        try:
            best = max(outputs, key=lambda o: o.get("score") or 0.0)
        except TypeError as exc:
            raise TypeError(f"Cannot compare segmentation outputs: {exc}") from exc

        mask = best.get("mask")
        if mask is None:
            raise ValueError(
                f"Best segmentation output missing 'mask' key. "
                f"Available keys: {list(best.keys())}"
            )
        if not isinstance(mask, Image.Image):
            raise TypeError(
                f"Expected PIL Image for mask, got {type(mask).__name__}"
            )
        return mask.convert("L")

    def _validate_mask_size(self, mask: Image.Image) -> None:
        if mask.width < self.MIN_MASK_DIMENSION or mask.height < self.MIN_MASK_DIMENSION:
            raise SegmentedImageTooSmallError(
                f"Segmented mask is too small ({mask.width}x{mask.height}). "
                f"Minimum dimension: {self.MIN_MASK_DIMENSION}px."
            )

    def _normalize_mask(self, mask: Image.Image, target: tuple[int, int]) -> Image.Image:
        if mask.size != target:
            mask = mask.resize(target, Image.BILINEAR)
        return mask

    def _apply_alpha(self, image: Image.Image, mask: Image.Image) -> Image.Image:
        rgba = image.copy()
        try:
            rgba.putalpha(mask)
        except ValueError as exc:
            raise RuntimeError(f"Failed to apply alpha mask: {exc}") from exc
        return rgba

    def _encode_png(self, image: Image.Image) -> bytes:
        buf = io.BytesIO()
        try:
            image.save(buf, format="PNG")
        except Exception as exc:
            raise RuntimeError(f"Failed to encode PNG: {exc}") from exc
        return buf.getvalue()

    # ------------------------------------------------------------------
    # Lazy model loading
    # ------------------------------------------------------------------
    def _lazy_load(self) -> None:
        if self._pipe is not None:
            return
        from transformers import pipeline  # type: ignore[import-untyped]

        self._pipe = pipeline("image-segmentation", model=_MODEL_NAME)

    def warmup(self) -> None:
        """Preload the model so the first request doesn't pay the load cost."""
        try:
            self._lazy_load()
        except Exception as exc:
            logger.warning("RMBGSegmenter warmup failed (%s); fallback will be used", exc)
