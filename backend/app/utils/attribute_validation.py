"""Validate clothing attributes against known taxonomy before saving.

This prevents injection of arbitrary keys and ensures only well-known
attribute names reach the database. ``normalize_attributes`` additionally
snaps enumerable values to their canonical taxonomy form (never
inventing replacements) so off-taxonomy values can't pollute filters.
"""

import logging

from app.utils.taxonomy import (
    ALL_TYPES,
    TAXONOMY_CATEGORIES,
    TAXONOMY_TYPES,
    TAXONOMY_MATERIALS,
    TAXONOMY_PATTERNS,
    TAXONOMY_STYLES,
    TAXONOMY_FITS,
    TAXONOMY_NECKLINES,
    TAXONOMY_SLEEVES,
    TAXONOMY_SEASONS,
    TAXONOMY_OCCASIONS,
    TAXONOMY_GENDERS,
    OCCASION_ALIASES,
    snap_to_taxonomy,
)

logger = logging.getLogger(__name__)

_VALID_SCALAR_KEYS = {
    "category", "type", "color", "color_hex", "secondary_color",
    "secondary_color_hex", "size", "pattern", "material", "style",
    "neckline", "sleeve_length", "fit", "length", "dress_length",
    "bottom_fit", "waist_rise", "heel_height", "warmth", "layer_type",
    "transparency", "stretch", "gender",
}

_VALID_LIST_KEYS = {"season", "occasion"}

_VALID_SCALAR_VALUES = {"brand", "description"}

_ALL_KNOWN = _VALID_SCALAR_KEYS | _VALID_LIST_KEYS | _VALID_SCALAR_VALUES


def validate_attributes(attributes: dict) -> dict[str, str | None]:
    """Check a user-submitted attributes dict for unknown or malicious keys.

    Returns a dict of ``{key: error_message}`` — empty means valid.
    """
    errors: dict[str, str | None] = {}
    if not isinstance(attributes, dict):
        errors["_root"] = "Attributes must be a JSON object"
        return errors

    for key in attributes:
        if key not in _ALL_KNOWN:
            errors[key] = f"Unknown attribute: {key}"
            continue

        value = attributes[key]

        if key in _VALID_LIST_KEYS:
            if not isinstance(value, list):
                errors[key] = f"'{key}' must be a list"
            else:
                for entry in value:
                    val = _extract_value(entry)
                    if val is not None and val != "unknown" and _has_injection(val):
                        errors[key] = f"'{key}' contains invalid characters"
                        break
            continue

        if key in _VALID_SCALAR_KEYS:
            val = _extract_value(value)
            if val is not None and _has_injection(val):
                errors[key] = f"'{key}' contains invalid characters"
            continue

    return errors


def _extract_value(attr: object) -> str | None:
    if isinstance(attr, dict):
        attr = attr.get("value")
    if isinstance(attr, str) and attr.strip():
        return attr.strip()
    return None


def _has_injection(value: str) -> bool:
    """Reject values containing obvious injection characters."""
    dangerous = {"__proto__", "constructor", "prototype", "<script", "javascript:"}
    lower = value.lower()
    for d in dangerous:
        if d in lower:
            return True
    return False


_ENUM_ALLOWLISTS: dict[str, list[str]] = {
    "pattern": TAXONOMY_PATTERNS,
    "material": TAXONOMY_MATERIALS,
    "style": TAXONOMY_STYLES,
    "fit": TAXONOMY_FITS,
    "neckline": TAXONOMY_NECKLINES,
    "sleeve_length": TAXONOMY_SLEEVES,
    "gender": TAXONOMY_GENDERS,
}

_LIST_ALLOWLISTS: dict[str, list[str]] = {
    "season": TAXONOMY_SEASONS,
    "occasion": TAXONOMY_OCCASIONS,
}

# Per-key value aliases applied before snapping (mobile vocabulary that has
# no canonical entry — see OCCASION_ALIASES in taxonomy.py).
_LIST_VALUE_ALIASES: dict[str, dict[str, str]] = {
    "occasion": OCCASION_ALIASES,
}


def normalize_attributes(attributes: dict) -> dict:
    """Snap enumerable attribute values to canonical taxonomy form.

    Case-insensitive exact matches are rewritten to canonical
    display-case; values with no match are dropped (logged, never
    replaced with an invented value). Mutates and returns *attributes*.
    """
    if not isinstance(attributes, dict):
        return attributes

    category = _extract_value(attributes.get("category"))
    snapped_cat = snap_to_taxonomy(category, TAXONOMY_CATEGORIES) if category else None
    if category and snapped_cat:
        _write_value(attributes, "category", snapped_cat)
    elif category:
        logger.warning("Dropping out-of-taxonomy category: %r", category)
        _write_value(attributes, "category", None)

    type_val = _extract_value(attributes.get("type"))
    if type_val:
        # Prefer the type list for the item's category, fall back to the
        # full union (covers mis-categorised but otherwise valid types).
        cat_key = (snapped_cat or category or "").lower()
        allowed = TAXONOMY_TYPES.get(cat_key, ALL_TYPES)
        snapped_type = snap_to_taxonomy(type_val, allowed) or snap_to_taxonomy(type_val, ALL_TYPES)
        if snapped_type:
            _write_value(attributes, "type", snapped_type)
        else:
            logger.warning("Dropping out-of-taxonomy type: %r", type_val)
            _write_value(attributes, "type", None)

    for key, allowed in _ENUM_ALLOWLISTS.items():
        val = _extract_value(attributes.get(key))
        if val is None:
            continue
        snapped = snap_to_taxonomy(val, allowed)
        if snapped:
            _write_value(attributes, key, snapped)
        else:
            logger.warning("Dropping out-of-taxonomy %s: %r", key, val)
            _write_value(attributes, key, None)

    for key, allowed in _LIST_ALLOWLISTS.items():
        entries = attributes.get(key)
        if not isinstance(entries, list):
            continue
        aliases = _LIST_VALUE_ALIASES.get(key, {})
        for i, entry in enumerate(entries):
            val = _extract_value(entry)
            if val is None:
                continue
            val = aliases.get(val.lower(), val)
            snapped = snap_to_taxonomy(val, allowed)
            if isinstance(entry, dict):
                entry["value"] = snapped
            else:
                entries[i] = snapped
            if snapped is None:
                logger.warning("Dropping out-of-taxonomy %s entry: %r", key, val)

    return attributes


def _write_value(attributes: dict, key: str, new: str | None) -> None:
    """Write a scalar attribute preserving its original shape (dict or str)."""
    existing = attributes.get(key)
    if isinstance(existing, dict):
        existing["value"] = new
    else:
        attributes[key] = new
