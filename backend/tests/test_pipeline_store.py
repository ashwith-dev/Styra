"""Tests for the pipeline staging store (Supabase mocked)."""

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from app.models.pipeline import StageMetrics
from app.services.pipeline_service import PipelineResult
from app.services import pipeline_store
from app.services.pipeline_store import (
    TTL,
    pop_pipeline_result,
    store_pipeline_result,
)


@pytest.fixture(autouse=True)
def _clear_memory_store():
    pipeline_store._memory_store.clear()
    yield
    pipeline_store._memory_store.clear()


def _result() -> PipelineResult:
    return PipelineResult(
        pipeline_token="tok-1",
        original_image_url="https://x/o.png",
        segmented_image_url="https://x/s.png",
        thumbnail_url="https://x/t.png",
        attributes=None,
        metrics=[
            StageMetrics(stage="validation", status="success", duration_ms=1.0)
        ],
    )


def _row(**overrides):
    row = {
        "token": "tok-1",
        "user_id": "user-1",
        "attributes": None,
        "original_image_url": "https://x/o.png",
        "segmented_image_url": "https://x/s.png",
        "thumbnail_url": "https://x/t.png",
        "metrics": [{"stage": "validation", "status": "success",
                     "duration_ms": 1.0, "error": None}],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    row.update(overrides)
    return row


def _client_returning(rows):
    """Mock client whose DELETE ... RETURNING yields *rows*."""
    client = MagicMock()
    table = client.table.return_value
    (
        table.delete.return_value
        .eq.return_value
        .eq.return_value
        .execute.return_value
    ).data = rows
    return client


@patch("app.services.pipeline_store.get_supabase")
def test_store_inserts_user_bound_row_and_prunes(mock_supabase) -> None:
    client = mock_supabase.return_value
    table = client.table.return_value

    store_pipeline_result(_result(), "user-1")

    client.table.assert_called_with("pipeline_staging")
    inserted = table.insert.call_args.args[0]
    assert inserted["token"] == "tok-1"
    assert inserted["user_id"] == "user-1"
    assert inserted["original_image_url"] == "https://x/o.png"
    # opportunistic TTL prune was issued
    table.delete.return_value.lt.assert_called_once()


@patch("app.services.pipeline_store.get_supabase")
def test_pop_returns_result_and_deletes_row(mock_supabase) -> None:
    mock_supabase.return_value = _client_returning([_row()])
    table = mock_supabase.return_value.table.return_value

    staged = pop_pipeline_result("tok-1", "user-1")

    assert staged is not None
    assert staged.original_image_url == "https://x/o.png"
    assert staged.segmented_image_url == "https://x/s.png"
    assert staged.metrics[0].stage == "validation"
    # single DELETE ... RETURNING filtered by token and user
    delete_eq = table.delete.return_value.eq
    delete_eq.assert_called_with("token", "tok-1")
    delete_eq.return_value.eq.assert_called_with("user_id", "user-1")


@patch("app.services.pipeline_store.get_supabase")
def test_pop_is_single_atomic_statement(mock_supabase) -> None:
    """The claim must be one DELETE ... RETURNING — no separate SELECT that
    a concurrent request could also pass before the delete lands."""
    mock_supabase.return_value = _client_returning([_row()])

    pop_pipeline_result("tok-1", "user-1")

    mock_supabase.return_value.table.return_value.select.assert_not_called()


@patch("app.services.pipeline_store.get_supabase")
def test_concurrent_claims_cannot_consume_token_twice(mock_supabase) -> None:
    """Two racing saves with the same token: Postgres returns the row to
    exactly one DELETE; the loser's DELETE matches nothing."""
    client = MagicMock()
    execute = (
        client.table.return_value
        .delete.return_value
        .eq.return_value
        .eq.return_value
        .execute
    )
    execute.side_effect = [
        SimpleNamespace(data=[_row()]),  # winner: row returned and deleted
        SimpleNamespace(data=[]),        # loser: row already gone
    ]
    mock_supabase.return_value = client

    first = pop_pipeline_result("tok-1", "user-1")
    second = pop_pipeline_result("tok-1", "user-1")

    assert first is not None
    assert second is None


@patch("app.services.pipeline_store.get_supabase")
def test_pop_wrong_user_returns_none(mock_supabase) -> None:
    # DB enforces the user filter; no row comes back for another user
    mock_supabase.return_value = _client_returning([])

    assert pop_pipeline_result("tok-1", "user-2") is None


@patch("app.services.pipeline_store.get_supabase")
def test_pop_expired_token_returns_none(mock_supabase) -> None:
    expired = (datetime.now(timezone.utc) - TTL - timedelta(minutes=1)).isoformat()
    mock_supabase.return_value = _client_returning([_row(created_at=expired)])

    assert pop_pipeline_result("tok-1", "user-1") is None


@patch("app.services.pipeline_store.get_supabase")
def test_store_swallows_supabase_failure_and_keeps_memory(mock_supabase) -> None:
    """A missing pipeline_staging table (PGRST205) must not break staging."""
    mock_supabase.return_value.table.return_value.insert.return_value.execute.side_effect = (
        Exception("PGRST205: table not found")
    )

    store_pipeline_result(_result(), "user-1")

    assert pipeline_store._memory_store["tok-1"][1] == "user-1"


@patch("app.services.pipeline_store.get_supabase")
def test_pop_returns_from_memory_without_supabase(mock_supabase) -> None:
    client = _client_returning([])
    client.table.return_value.insert.return_value.execute.side_effect = Exception(
        "PGRST205: table not found"
    )
    mock_supabase.return_value = client
    store_pipeline_result(_result(), "user-1")

    staged = pop_pipeline_result("tok-1", "user-1")

    assert staged is not None
    assert staged.original_image_url == "https://x/o.png"
    # memory hit: Supabase DELETE was never needed
    mock_supabase.return_value.table.return_value.delete.assert_not_called()
    # token consumed: a second pop finds nothing
    assert pop_pipeline_result("tok-1", "user-1") is None


@patch("app.services.pipeline_store.get_supabase")
def test_pop_memory_entry_wrong_user_falls_through(mock_supabase) -> None:
    mock_supabase.return_value = _client_returning([])
    pipeline_store._memory_store["tok-1"] = (_result(), "user-1")

    assert pop_pipeline_result("tok-1", "user-2") is None


@patch("app.services.pipeline_store.get_supabase")
def test_pop_supabase_failure_returns_none(mock_supabase) -> None:
    mock_supabase.return_value.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.side_effect = (
        Exception("PGRST205: table not found")
    )

    assert pop_pipeline_result("tok-1", "user-1") is None
