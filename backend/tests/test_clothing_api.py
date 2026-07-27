"""Tests for the clothing CRUD API (mocked)."""

from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from jose import jwt as jose_jwt

from app.main import app

client = TestClient(app)


def _token(secret: str = "test-secret") -> str:
    return jose_jwt.encode(
        {"sub": "user-1", "aud": "authenticated"}, secret, algorithm="HS256"
    )


@patch("app.utils.jwt.settings.supabase_jwt_secret", "test-secret")
@patch("app.api.clothing.get_supabase")
def test_list_clothing_empty(mock_supabase) -> None:
    """GET /clothing returns empty list when user has no items."""
    mock_supabase.return_value.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = []

    resp = client.get("/clothing", headers={"Authorization": f"Bearer {_token()}"})
    assert resp.status_code == 200
    assert resp.json() == {"items": []}


@patch("app.utils.jwt.settings.supabase_jwt_secret", "test-secret")
@patch("app.api.clothing.pop_pipeline_result")
@patch("app.api.clothing.get_supabase")
def test_save_clothing_upserts_profile_and_embeds(mock_supabase, mock_pop) -> None:
    """POST /clothing guarantees the profile row (FK target) and stores an
    embedding so recommendations have something to match on."""
    mock_pop.return_value = SimpleNamespace(
        original_image_url="https://x/o.png",
        segmented_image_url="https://x/s.png",
        thumbnail_url=None,
        attributes=None,
        metrics=[],
    )

    profiles_table = MagicMock(name="profiles")
    items_table = MagicMock(name="clothing_items")
    mock_supabase.return_value.table.side_effect = {
        "profiles": profiles_table,
        "clothing_items": items_table,
    }.get
    items_table.insert.return_value.execute.return_value.data = [
        {
            "id": "item-1",
            "original_image_url": "https://x/o.png",
            "segmented_image_url": "https://x/s.png",
            "thumbnail_url": None,
            "attributes": {"category": {"value": "top", "confidence": 1.0}},
        }
    ]

    resp = client.post(
        "/clothing",
        json={
            "pipeline_token": "tok",
            "attributes": {
                "category": {"value": "top", "confidence": 1.0},
                "type": {"value": "t-shirt", "confidence": 1.0},
            },
        },
        headers={"Authorization": f"Bearer {_token()}"},
    )
    assert resp.status_code == 201

    profiles_table.upsert.assert_called_once_with({"id": "user-1"}, on_conflict="id")

    inserted = items_table.insert.call_args[0][0]
    assert inserted["embedding"].startswith("[")
    assert inserted["embedding"].endswith("]")
    assert len(inserted["embedding"][1:-1].split(",")) == 512
