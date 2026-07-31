"""Mapping between the API's ``attributes`` object and the flat
``clothing_items`` columns (category, subcategory, color, season,
occasion, brand, ai_tags).

Pure functions over plain dicts — no request objects, no DB sessions —
so they can be unit-tested in isolation. The full attribute object is
also stored in the ``attributes`` jsonb column, so nothing the AI
extracted (pattern, material, style, fit, confidences, description) is
ever lost.
"""

from typing import Any, Optional

# Extra extracted attributes surfaced as simple search tags.
_TAG_FIELDS = ("style", "pattern", "material", "fit")


def _attr_value(attr: Any) -> Optional[str]:
    """Pull a plain string out of an AttributeConfidence-shaped value."""
    if isinstance(attr, dict):
        attr = attr.get("value")
    if isinstance(attr, str) and attr.strip():
        return attr.strip()
    return None


def _attr_list(entries: Any) -> list[str]:
    if not isinstance(entries, list):
        return []
    values = [_attr_value(e) for e in entries]
    return [v for v in values if v]


def attributes_to_row(attributes: dict) -> dict:
    """Decompose an attributes object into flat ``clothing_items`` columns."""
    ai_tags: list[str] = []
    for field in _TAG_FIELDS:
        value = _attr_value(attributes.get(field))
        if value and value.lower() != "unknown" and value not in ai_tags:
            ai_tags.append(value)

    return {
        "category": _attr_value(attributes.get("category")),
        "subcategory": _attr_value(attributes.get("type")),
        "color": _attr_value(attributes.get("color")),
        "season": _attr_list(attributes.get("season")),
        "occasion": _attr_list(attributes.get("occasion")),
        "brand": _attr_value(attributes.get("brand")),
        "ai_tags": ai_tags,
        "attributes": attributes,
    }


def row_to_attributes(row: dict) -> dict:
    """Rebuild the attributes object from a ``clothing_items`` row.

    Prefers the stored jsonb (full fidelity); falls back to
    reconstructing from the flat columns for older rows.
    """
    stored = row.get("attributes")
    if isinstance(stored, dict) and stored:
        return stored

    result: dict[str, Any] = {}
    if row.get("category"):
        result["category"] = {"value": row["category"], "confidence": 1.0}
    if row.get("subcategory"):
        result["type"] = {"value": row["subcategory"], "confidence": 1.0}
    if row.get("color"):
        result["color"] = {"value": row["color"], "confidence": 1.0}
    result["season"] = [
        {"value": s, "confidence": 1.0} for s in (row.get("season") or [])
    ]
    result["occasion"] = [
        {"value": o, "confidence": 1.0} for o in (row.get("occasion") or [])
    ]
    if row.get("brand"):
        result["brand"] = row["brand"]
    return result
