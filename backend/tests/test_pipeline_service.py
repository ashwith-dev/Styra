"""Orchestration tests for PipelineService (all stage backends mocked)."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

from app.models.pipeline import StageMetrics
from app.services.pipeline_service import PipelineService


def _storage() -> MagicMock:
    storage = MagicMock()
    storage.upload_original.return_value = SimpleNamespace(
        path="orig/o.png", public_url="https://x/o.png"
    )
    storage.upload_segmented.return_value = SimpleNamespace(
        path="seg/s.png", public_url="https://x/s.png"
    )
    storage.upload_thumbnail.return_value = SimpleNamespace(
        path="thumb/t.png", public_url="https://x/t.png"
    )
    return storage


def _segmenter() -> MagicMock:
    segmenter = MagicMock()
    segmenter.segment.return_value = SimpleNamespace(segmented_bytes=b"seg")
    return segmenter


def _service(validator, segmenter, extractor, storage) -> PipelineService:
    return PipelineService(
        validator=validator,
        segmenter=segmenter,
        extractor=extractor,
        storage=storage,
    )


def test_validation_failure_uploads_nothing() -> None:
    validator = MagicMock()
    validator.validate.return_value = (False, ["too blurry"])
    storage = _storage()
    svc = _service(validator, _segmenter(), AsyncMock(), storage)

    result = asyncio.run(svc.run(b"img"))

    assert result.status == "failed"
    assert result.stage_failed == "validation"
    storage.upload_original.assert_not_called()
    storage.upload_segmented.assert_not_called()


def test_validator_exception_becomes_structured_failure() -> None:
    validator = MagicMock()
    validator.validate.side_effect = RuntimeError("cv2 exploded")
    svc = _service(validator, _segmenter(), AsyncMock(), _storage())

    result = asyncio.run(svc.run(b"img"))

    assert result.status == "failed"
    assert result.stage_failed == "validation"
    assert "cv2 exploded" in (result.error_message or "")


def test_segmentation_failure_leaves_storage_untouched() -> None:
    validator = MagicMock()
    validator.validate.return_value = (True, [])
    segmenter = _segmenter()
    segmenter.segment.side_effect = RuntimeError("model blew up")
    storage = _storage()
    svc = _service(validator, segmenter, AsyncMock(), storage)

    result = asyncio.run(svc.run(b"img"))

    assert result.stage_failed == "segmentation"
    storage.upload_original.assert_not_called()


def test_extraction_failure_cleans_up_all_uploads() -> None:
    validator = MagicMock()
    validator.validate.return_value = (True, [])
    extractor = AsyncMock()
    extractor.extract.side_effect = RuntimeError("provider 500")
    storage = _storage()
    svc = _service(validator, _segmenter(), extractor, storage)

    result = asyncio.run(svc.run(b"img"))

    assert result.stage_failed == "extraction"
    deleted = {c.args[0] for c in storage.delete.call_args_list}
    assert deleted == {"orig/o.png", "seg/s.png", "thumb/t.png"}


def test_storage_failure_cleans_up_partial_uploads() -> None:
    validator = MagicMock()
    validator.validate.return_value = (True, [])
    storage = _storage()
    storage.upload_segmented.side_effect = RuntimeError("bucket down")
    svc = _service(validator, _segmenter(), AsyncMock(), storage)

    result = asyncio.run(svc.run(b"img"))

    assert result.stage_failed == "storage"
    # original was uploaded before segmented failed → must be removed
    storage.delete.assert_called_once_with("orig/o.png")


def test_success_returns_urls_and_stage_metrics() -> None:
    validator = MagicMock()
    validator.validate.return_value = (True, [])
    extractor = AsyncMock()
    extractor.extract.return_value = None
    svc = _service(validator, _segmenter(), extractor, _storage())

    result = asyncio.run(svc.run(b"img"))

    assert result.status == "completed"
    assert result.original_image_url == "https://x/o.png"
    assert result.segmented_image_url == "https://x/s.png"
    assert result.thumbnail_url == "https://x/t.png"
    stages = [m.stage for m in result.metrics]
    assert stages == ["validation", "segmentation", "storage", "extraction"]
    assert all(m.status == "success" for m in result.metrics)


def test_warmup_swallows_segmenter_failure() -> None:
    segmenter = _segmenter()
    segmenter.warmup.side_effect = RuntimeError("no GPU")
    svc = _service(MagicMock(), segmenter, AsyncMock(), _storage())

    asyncio.run(svc.warmup())  # must not raise


def test_result_has_no_image_bytes_field() -> None:
    """Regression: staged results must not retain raw upload bytes."""
    from dataclasses import fields

    from app.services.pipeline_service import PipelineResult

    assert "image_bytes" not in {f.name for f in fields(PipelineResult)}
