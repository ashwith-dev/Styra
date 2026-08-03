"""Integration tests for PipelineService and /analyze-clothing.

All external services (validator, segmenter, extractor, storage, Supabase)
are mocked so tests run fast and deterministically.
"""

import io
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from jose import jwt as jose_jwt
from PIL import Image

from app.services.pipeline_service import PipelineResult
from app.services.extraction.base_attributes import AIPipelineResult as AIResult, AttributeConfidence
from app.models.pipeline import StageMetrics


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _image_bytes(size: tuple[int, int] = (64, 64)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, (128, 128, 128)).save(buf, format="JPEG")
    return buf.getvalue()


def _png_bytes(size: tuple[int, int] = (64, 64)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGBA", size, (128, 128, 128, 255)).save(buf, format="PNG")
    return buf.getvalue()


def _token() -> str:
    return jose_jwt.encode(
        {"sub": "user-1", "aud": "authenticated"}, "test-jwt-secret", algorithm="HS256",
    )


# ---------------------------------------------------------------------------
# Pipeline Service — unit tests (direct, no HTTP)
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_validator():
    v = MagicMock()
    v.validate.return_value = (True, [])
    return v


@pytest.fixture
def mock_segmenter():
    s = MagicMock()
    s.segment.return_value = SimpleNamespace(
        segmented_bytes=_png_bytes(),
        mask_bytes=_png_bytes((64, 64)),
        model_name="test",
    )
    return s


@pytest.fixture
def mock_extractor():
    e = AsyncMock()
    e.extract.return_value = SimpleNamespace(
        category=SimpleNamespace(value="top", confidence=0.98),
        type=SimpleNamespace(value="t-shirt", confidence=0.95),
        color=SimpleNamespace(value="black", confidence=0.99),
        model_name="Qwen2.5-VL-3B-Instruct",
        model_version="test",
        model_dump=lambda: {
            "category": {"value": "top", "confidence": 0.98},
            "type": {"value": "t-shirt", "confidence": 0.95},
            "color": {"value": "black", "confidence": 0.99},
        },
    )
    return e


@pytest.fixture
def mock_storage():
    st = MagicMock()
    st.upload_original.return_value = SimpleNamespace(
        path="originals/test.png", public_url="https://storage/o.png",
    )
    st.upload_segmented.return_value = SimpleNamespace(
        path="segmented/test.png", public_url="https://storage/s.png",
    )
    st.upload_thumbnail.return_value = SimpleNamespace(
        path="thumbs/test.png", public_url="https://storage/t.png",
    )
    return st


@pytest.mark.asyncio
async def test_pipeline_success(mock_validator, mock_segmenter, mock_extractor, mock_storage):
    """End-to-end: all stages pass, metrics are recorded, result is valid."""
    from app.services.pipeline_service import PipelineService

    service = PipelineService(mock_validator, mock_segmenter, mock_extractor, mock_storage)
    result = await service.run(_image_bytes())

    assert result.status == "completed"
    assert result.stage_failed is None
    assert result.error_message is None
    assert result.attributes is not None
    assert result.attributes.model_name == "Qwen2.5-VL-3B-Instruct"
    assert result.original_image_url == "https://storage/o.png"
    assert result.segmented_image_url == "https://storage/s.png"
    assert result.thumbnail_url == "https://storage/t.png"

    # Stages: validation, segmentation, storage, extraction = 4
    stage_names = [m.stage for m in result.metrics]
    assert stage_names == ["validation", "segmentation", "storage", "extraction"]
    for m in result.metrics:
        assert m.status == "success"
        assert m.duration_ms >= 0
        assert m.error is None


@pytest.mark.asyncio
async def test_pipeline_validation_failure(mock_validator, mock_segmenter, mock_extractor, mock_storage):
    """Validation failure stops the pipeline immediately, no uploads."""
    mock_validator.validate.return_value = (False, ["Resolution too low"])

    from app.services.pipeline_service import PipelineService

    service = PipelineService(mock_validator, mock_segmenter, mock_extractor, mock_storage)
    result = await service.run(_image_bytes())

    assert result.status == "failed"
    assert result.stage_failed == "validation"
    assert "Resolution too low" in (result.error_message or "")

    # Only validation ran, no uploads
    assert len(result.metrics) == 1
    assert result.metrics[0].stage == "validation"

    # Storage and segmenter should not have been called
    mock_storage.upload_original.assert_not_called()
    mock_segmenter.segment.assert_not_called()


@pytest.mark.asyncio
async def test_pipeline_segmentation_failure(mock_validator, mock_segmenter, mock_extractor, mock_storage):
    """Segmentation failure stops before uploads."""
    mock_segmenter.segment.side_effect = ValueError("Model failed to load")

    from app.services.pipeline_service import PipelineService

    service = PipelineService(mock_validator, mock_segmenter, mock_extractor, mock_storage)
    result = await service.run(_image_bytes())

    assert result.status == "failed"
    assert result.stage_failed == "segmentation"
    assert "segmentation" in str(result.metrics)

    # Storage should not have been called
    mock_storage.upload_original.assert_not_called()


@pytest.mark.asyncio
async def test_pipeline_extraction_failure(mock_validator, mock_segmenter, mock_extractor, mock_storage):
    """Extraction failure cleans up the uploads it orphaned."""
    mock_extractor.extract.side_effect = RuntimeError("API timeout")

    from app.services.pipeline_service import PipelineService

    service = PipelineService(mock_validator, mock_segmenter, mock_extractor, mock_storage)
    result = await service.run(_image_bytes())

    assert result.status == "failed"
    assert result.stage_failed == "extraction"
    assert result.attributes is None

    # Uploads happened, then were removed again so nothing is orphaned
    mock_storage.upload_original.assert_called_once()
    mock_storage.upload_segmented.assert_called_once()
    deleted = {c.args[0] for c in mock_storage.delete.call_args_list}
    assert deleted == {"originals/test.png", "segmented/test.png", "thumbs/test.png"}


@pytest.mark.asyncio
async def test_pipeline_storage_failure(mock_validator, mock_segmenter, mock_extractor, mock_storage):
    """Storage failure stops the pipeline."""
    mock_storage.upload_original.side_effect = RuntimeError("Storage unavailable")

    from app.services.pipeline_service import PipelineService

    service = PipelineService(mock_validator, mock_segmenter, mock_extractor, mock_storage)
    result = await service.run(_image_bytes())

    assert result.status == "failed"
    assert result.stage_failed == "storage"


@pytest.mark.asyncio
async def test_pipeline_timing(mock_validator, mock_segmenter, mock_extractor, mock_storage):
    """Every stage records a non-negative duration."""
    from app.services.pipeline_service import PipelineService

    service = PipelineService(mock_validator, mock_segmenter, mock_extractor, mock_storage)
    result = await service.run(_image_bytes())

    for m in result.metrics:
        assert m.duration_ms >= 0, f"{m.stage} duration was negative"

    total = sum(m.duration_ms for m in result.metrics)
    assert total > 0, "total pipeline time should be positive"


# ---------------------------------------------------------------------------
# Token store
# ---------------------------------------------------------------------------
# The in-memory token store was replaced by the DB-backed store in
# app/services/pipeline_store.py (multi-worker safe, TTL-bound, user-bound).
# Its behaviour is covered by tests/test_pipeline_store.py.


# ---------------------------------------------------------------------------
# /analyze-clothing HTTP endpoint
# ---------------------------------------------------------------------------

def _override_auth() -> None:
    from app.dependencies import get_current_user
    from app.main import app

    app.dependency_overrides[get_current_user] = lambda: "user-1"


def teardown_module() -> None:
    from app.main import app

    app.dependency_overrides.clear()


def test_analyze_clothing_no_pipeline() -> None:
    """When pipeline_service is None, return 503."""
    from app.main import app

    _override_auth()
    with patch("app.main.pipeline_service", None):
        client = TestClient(app)
        resp = client.post(
            "/v1/analyze-clothing",
            files={"file": ("test.jpg", _image_bytes(), "image/jpeg")},
            headers={"Authorization": f"Bearer {_token()}"},
        )
        assert resp.status_code == 503
        assert "not available" in resp.json()["detail"]


def _run_pipeline_test(pipeline_result, expected_status: int) -> TestClient:
    """Helper: patch pipeline_service and POST /analyze-clothing."""
    from app.main import app

    mock_pipeline = AsyncMock()
    mock_pipeline.run.return_value = pipeline_result

    _override_auth()
    with patch("app.main.pipeline_service", mock_pipeline):
        client = TestClient(app)
        resp = client.post(
            "/v1/analyze-clothing",
            files={"file": ("test.jpg", _image_bytes(), "image/jpeg")},
            headers={"Authorization": f"Bearer {_token()}"},
        )
        assert resp.status_code == expected_status, f"Body: {resp.text}"
        return resp


@patch("app.api.analyze.persist_pipeline_result")
@patch("app.api.analyze.stage_pipeline_result")
def test_analyze_clothing_success(mock_stage, mock_persist) -> None:
    """Full endpoint integration: pipeline runs and returns structured data."""
    result = PipelineResult(
        pipeline_token="tok-1",
        original_image_path="o/test.png",
        original_image_url="https://storage/o.png",
        segmented_image_url="https://storage/s.png",
        thumbnail_url="https://storage/t.png",
        attributes=AIResult(
            category=AttributeConfidence(value="top", confidence=0.98),
            type=AttributeConfidence(value="t-shirt", confidence=0.95),
            color=AttributeConfidence(value="black", confidence=0.99),
            model_name="Qwen2.5-VL-3B-Instruct",
            model_version="test",
        ),
        metrics=[],
        status="completed",
    )
    resp = _run_pipeline_test(result, 200)
    data = resp.json()
    assert data["pipeline_token"] == "tok-1"
    assert data["result"]["category"]["value"] == "top"
    assert data["segmented_image_url"] == "https://storage/s.png"


def test_analyze_clothing_pipeline_failure() -> None:
    """Pipeline failure returns 400 with stage and error details."""
    result = PipelineResult(
        pipeline_token="tok-2",
        status="failed",
        stage_failed="validation",
        error_message="Resolution too low",
        metrics=[StageMetrics(stage="validation", status="failed", duration_ms=12.0, error="Resolution too low")],
    )
    resp = _run_pipeline_test(result, 400)
    detail = resp.json()["detail"]
    assert detail["stage_failed"] == "validation"
    assert "Resolution too low" in detail["error"]

def test_analyze_clothing_large_file() -> None:
    """File over 10 MB is rejected before the pipeline runs."""
    from app.main import app

    _override_auth()
    with patch("app.main.pipeline_service", AsyncMock()) as mock_pipe:
        client = TestClient(app)
        large = b"x" * (11 * 1024 * 1024)
        resp = client.post(
            "/v1/analyze-clothing",
            files={"file": ("large.jpg", large, "image/jpeg")},
            headers={"Authorization": f"Bearer {_token()}"},
        )
        assert resp.status_code == 413, f"Body: {resp.text}"
        mock_pipe.run.assert_not_called()
