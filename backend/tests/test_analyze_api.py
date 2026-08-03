"""Analyze endpoint staging behaviour (pipeline service mocked)."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.analyze import _get_pipeline_service
from app.dependencies import get_current_user
from app.main import app
from app.models.pipeline import StageMetrics
from app.services.extraction.base_attributes import (
    AIPipelineResult,
    AttributeConfidence,
)
from app.services.pipeline_service import PipelineResult

client = TestClient(app)


@pytest.fixture(autouse=True)
def _clear_overrides():
    yield
    app.dependency_overrides.clear()


def _override(result: PipelineResult) -> None:
    pipeline = MagicMock()
    pipeline.run = AsyncMock(return_value=result)
    app.dependency_overrides[_get_pipeline_service] = lambda: pipeline
    app.dependency_overrides[get_current_user] = lambda: "user-1"


def _completed_result() -> PipelineResult:
    return PipelineResult(
        pipeline_token="tok-1",
        original_image_url="https://x/o.png",
        segmented_image_url="https://x/s.png",
        attributes=AIPipelineResult(
            category=AttributeConfidence(value="top", confidence=0.9),
            type=AttributeConfidence(value="t-shirt", confidence=0.9),
            color=AttributeConfidence(value="navy", confidence=0.9),
        ),
        metrics=[
            StageMetrics(stage="validation", status="success", duration_ms=1.0)
        ],
    )


def _failed_result() -> PipelineResult:
    return PipelineResult(
        pipeline_token="tok-2",
        status="failed",
        stage_failed="validation",
        error_message="too blurry",
        metrics=[
            StageMetrics(
                stage="validation",
                status="failed",
                duration_ms=1.0,
                error="too blurry",
            )
        ],
    )


@patch("app.api.analyze.persist_pipeline_result")
@patch("app.api.analyze.stage_pipeline_result")
def test_failed_result_is_not_staged(mock_stage, mock_persist) -> None:
    _override(_failed_result())
    resp = client.post(
        "/v1/analyze-clothing",
        files={"file": ("a.jpg", b"img-bytes", "image/jpeg")},
    )
    assert resp.status_code == 400
    assert resp.json()["detail"]["stage_failed"] == "validation"
    mock_stage.assert_not_called()
    mock_persist.assert_not_called()


@patch("app.api.analyze.persist_pipeline_result")
@patch("app.api.analyze.stage_pipeline_result")
def test_successful_result_is_staged_for_calling_user(mock_stage, mock_persist) -> None:
    _override(_completed_result())
    resp = client.post(
        "/v1/analyze-clothing",
        files={"file": ("a.jpg", b"img-bytes", "image/jpeg")},
    )
    assert resp.status_code == 200
    assert resp.json()["pipeline_token"] == "tok-1"
    result_arg, user_arg = mock_stage.call_args.args
    assert result_arg.pipeline_token == "tok-1"
    assert user_arg == "user-1"
