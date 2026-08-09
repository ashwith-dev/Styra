"""Build semantic text representations from clothing item attributes.

Produces a single natural-language sentence per item for use as
embedding model input. Never includes null / empty / "unknown" values.
"""

from typing import Any, Optional


_TEXT_TEMPLATE_FIELDS = [
    ("gender", "gender"),
    ("color", "color"),
    ("material", "material"),
    ("fit", "fit"),
    ("neckline", "neckline"),
    ("sleeve_length", "sleeve"),
    ("length", "length"),
    ("category", "category"),
    ("type", "type"),
    ("style", "style"),
    ("pattern", "pattern"),
    ("brand", "brand"),
]

_SEASON_MAP = {
    "spring": "Spring", "summer": "Summer",
    "fall": "Fall", "winter": "Winter",
}
_OCCASION_MAP = {
    "casual": "Casual", "business": "Business", "formal": "Formal",
    "sporty": "Sporty", "party": "Party", "date": "Date",
    "beach": "Beach", "travel": "Travel",
    "office": "Office", "college": "College",
    "date_night": "Date Night", "gym": "Gym", "ethnic": "Ethnic",
}


def _attr_value(attr: Any) -> Optional[str]:
    """Pull a plain string out of an AttributeConfidence-shaped value."""
    if isinstance(attr, dict):
        attr = attr.get("value")
    if isinstance(attr, str):
        stripped = attr.strip()
        if stripped and stripped.lower() not in ("unknown", "none", "n/a", ""):
            return stripped
    return None


def _list_values(entries: Any) -> list[str]:
    """Extract plain string values from a list of AttributeConfidence entries."""
    if not isinstance(entries, list):
        return []
    results: list[str] = []
    for entry in entries:
        val = _attr_value(entry)
        if val:
            results.append(val)
    return results


def build_semantic_text(attributes: dict) -> str:
    """Build a human-readable semantic sentence from clothing attributes.

    Example output:
        "Men's Black Cotton Regular Fit Crew Neck T-Shirt Casual Minimal Summer"

    Args:
        attributes: The clothing item's full attributes dict (AttributeConfidence
                    shaped values or plain strings).

    Returns:
        A single sentence string, or an empty string if no fields are available.
    """
    parts: list[str] = []

    for attr_key, label in _TEXT_TEMPLATE_FIELDS:
        val = _attr_value(attributes.get(attr_key))
        if val:
            parts.append(val)

    seasons = _list_values(attributes.get("season"))
    for s in seasons:
        mapped = _SEASON_MAP.get(s.lower(), s.title())
        if mapped not in parts:
            parts.append(mapped)

    occasions = _list_values(attributes.get("occasion"))
    for o in occasions:
        mapped = _OCCASION_MAP.get(o.lower(), o.title())
        if mapped not in parts:
            parts.append(mapped)

    return " ".join(parts)
