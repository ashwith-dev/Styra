"""Unit tests for the attributes ↔ flat clothing_items column mapping."""

from app.services.clothing_mapper import attributes_to_row, row_to_attributes


def _attributes() -> dict:
    return {
        "category": {"value": "bottom", "confidence": 0.95},
        "type": {"value": "trousers", "confidence": 0.9},
        "color": {"value": "Black", "confidence": 0.9},
        "color_hex": {"value": "#1a1a1a", "confidence": 0.9},
        "style": {"value": "casual", "confidence": 0.8},
        "pattern": {"value": "solid", "confidence": 0.7},
        "season": [
            {"value": "spring", "confidence": 1.0},
            {"value": "summer", "confidence": 1.0},
        ],
        "occasion": [{"value": "casual", "confidence": 1.0}],
        "brand": "Levi's",
        "description": "Classic black trousers",
    }


def test_attributes_to_row_maps_flat_columns() -> None:
    row = attributes_to_row(_attributes())

    assert row["category"] == "bottom"
    assert row["subcategory"] == "trousers"
    assert row["color"] == "Black"
    assert row["season"] == ["spring", "summer"]
    assert row["occasion"] == ["casual"]
    assert row["brand"] == "Levi's"
    assert row["attributes"]["type"]["value"] == "trousers"


def test_attributes_to_row_builds_ai_tags_without_duplicates() -> None:
    row = attributes_to_row(_attributes())

    assert row["ai_tags"] == ["casual", "solid"]


def test_attributes_to_row_tolerates_plain_strings_and_missing_keys() -> None:
    row = attributes_to_row({"category": "top", "brand": None})

    assert row["category"] == "top"
    assert row["subcategory"] is None
    assert row["season"] == []
    assert row["occasion"] == []
    assert row["brand"] is None
    assert row["ai_tags"] == []


def test_row_to_attributes_prefers_stored_jsonb() -> None:
    stored = _attributes()
    row = {"attributes": stored, "category": "WRONG"}

    assert row_to_attributes(row) == stored


def test_row_to_attributes_reconstructs_from_flat_columns() -> None:
    row = {
        "attributes": {},
        "category": "bottom",
        "subcategory": "trousers",
        "color": "Black",
        "season": ["summer"],
        "occasion": ["casual", "everyday"],
        "brand": "Zara",
    }

    attrs = row_to_attributes(row)

    assert attrs["category"] == {"value": "bottom", "confidence": 1.0}
    assert attrs["type"] == {"value": "trousers", "confidence": 1.0}
    assert attrs["color"] == {"value": "Black", "confidence": 1.0}
    assert attrs["season"] == [{"value": "summer", "confidence": 1.0}]
    assert len(attrs["occasion"]) == 2
    assert attrs["brand"] == "Zara"
