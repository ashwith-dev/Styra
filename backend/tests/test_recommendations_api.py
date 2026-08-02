"""Tests for the GET /recommendations API endpoint (outfit recommendations)."""

from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from jose import jwt as jose_jwt

from app.main import app
from app.utils.jwt import get_user_supabase

client = TestClient(app)


def _override_user_client(mock: MagicMock):
    app.dependency_overrides[get_user_supabase] = lambda: mock


def teardown_module():
    app.dependency_overrides.clear()


def _token(secret: str = "test-jwt-secret") -> str:
    return jose_jwt.encode(
        {"sub": "user-1", "aud": "authenticated"}, secret, algorithm="HS256"
    )


def _item(
    id_: str,
    category: str,
    color: str = "navy",
    style: str = "casual",
    seasons: list[str] | None = None,
    occasions: list[str] | None = None,
) -> dict:
    return {
        "id": id_,
        "attributes": {
            "category": {"value": category, "confidence": 0.9},
            "type": {"value": "test-type", "confidence": 0.9},
            "color": {"value": color, "confidence": 0.9},
            "style": {"value": style, "confidence": 0.9},
            "season": [{"value": s, "confidence": 1.0} for s in (seasons or ["summer"])],
            "occasion": [{"value": o, "confidence": 1.0} for o in (occasions or ["everyday"])],
        },
        "thumbnail_url": None,
        "status": "completed",
    }


@patch("app.utils.jwt.settings.supabase_jwt_secret", "test-jwt-secret")
def test_get_recommendations_empty_wardrobe():
    """Empty wardrobe returns 404."""
    supabase = MagicMock()
    _override_user_client(supabase)
    supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = None

    resp = client.get(
        "/recommendations",
        headers={"Authorization": f"Bearer {_token()}"},
    )
    assert resp.status_code == 404
    assert "No clothing items" in resp.json()["detail"]


@patch("app.utils.jwt.settings.supabase_jwt_secret", "test-jwt-secret")
def test_get_recommendations_success():
    """Returns recommendations for a wardrobe with enough items."""
    supabase = MagicMock()
    _override_user_client(supabase)
    supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        _item("t1", "top", color="navy", style="casual"),
        _item("t2", "top", color="white", style="casual"),
        _item("b1", "bottom", color="navy", style="casual"),
        _item("b2", "bottom", color="black", style="casual"),
        _item("f1", "footwear", color="black", style="casual"),
        _item("f2", "footwear", color="white", style="casual"),
    ]

    resp = client.get(
        "/recommendations",
        headers={"Authorization": f"Bearer {_token()}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "recommendations" in body
    assert len(body["recommendations"]) > 0

    rec = body["recommendations"][0]
    assert len(rec["outfit_items"]) >= 2
    assert 0 <= rec["score"] <= 100
    assert rec["explanation"] != ""
    assert rec["outfit_category"] in {
        "casual", "formal", "office", "college", "party",
        "date_night", "travel", "gym", "ethnic",
    }

    for item in rec["outfit_items"]:
        assert "id" in item
        assert "attributes" in item


@patch("app.utils.jwt.settings.supabase_jwt_secret", "test-jwt-secret")
def test_get_recommendations_with_occasion_filter():
    """Occasion filter only returns that outfit category."""
    supabase = MagicMock()
    _override_user_client(supabase)
    supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        _item("t1", "top"),
        _item("b1", "bottom"),
        _item("f1", "footwear"),
    ]

    resp = client.get(
        "/recommendations?occasion=casual",
        headers={"Authorization": f"Bearer {_token()}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    for rec in body["recommendations"]:
        assert rec["outfit_category"] == "casual"


@patch("app.utils.jwt.settings.supabase_jwt_secret", "test-jwt-secret")
def test_get_recommendations_with_season_filter():
    """Season filter works without error."""
    supabase = MagicMock()
    _override_user_client(supabase)
    supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        _item("t1", "top", seasons=["summer"]),
        _item("b1", "bottom", seasons=["summer"]),
        _item("f1", "footwear", seasons=["summer"]),
    ]

    resp = client.get(
        "/recommendations?season=summer",
        headers={"Authorization": f"Bearer {_token()}"},
    )
    assert resp.status_code == 200


@patch("app.utils.jwt.settings.supabase_jwt_secret", "test-jwt-secret")
def test_get_recommendations_with_combined_filters():
    """Combined occasion + season filter."""
    supabase = MagicMock()
    _override_user_client(supabase)
    supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        _item("t1", "top", seasons=["summer"], occasions=["everyday"]),
        _item("b1", "bottom", seasons=["summer"], occasions=["everyday"]),
        _item("f1", "footwear", seasons=["summer"], occasions=["everyday"]),
    ]

    resp = client.get(
        "/recommendations?occasion=casual&season=summer",
        headers={"Authorization": f"Bearer {_token()}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    for rec in body["recommendations"]:
        assert rec["outfit_category"] == "casual"


@patch("app.utils.jwt.settings.supabase_jwt_secret", "test-jwt-secret")
def test_get_recommendations_invalid_occasion():
    """Invalid occasion returns 422."""
    supabase = MagicMock()
    _override_user_client(supabase)
    supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        _item("1", "top")
    ]

    resp = client.get(
        "/recommendations?occasion=underwater",
        headers={"Authorization": f"Bearer {_token()}"},
    )
    assert resp.status_code == 422
    assert "Invalid occasion" in resp.json()["detail"]


@patch("app.utils.jwt.settings.supabase_jwt_secret", "test-jwt-secret")
def test_get_recommendations_invalid_season():
    """Invalid season returns 422."""
    supabase = MagicMock()
    _override_user_client(supabase)
    supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        _item("1", "top")
    ]

    resp = client.get(
        "/recommendations?season=monsoon",
        headers={"Authorization": f"Bearer {_token()}"},
    )
    assert resp.status_code == 422
    assert "Invalid season" in resp.json()["detail"]


@patch("app.utils.jwt.settings.supabase_jwt_secret", "test-jwt-secret")
def test_get_recommendations_unauthenticated():
    """No token returns 401 or 403."""
    supabase = MagicMock()
    _override_user_client(supabase)
    supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        _item("1", "top")
    ]

    resp = client.get("/recommendations")
    assert resp.status_code in (401, 403)
