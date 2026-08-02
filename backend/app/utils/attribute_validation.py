"""Validate clothing attributes against known taxonomy before saving.

This prevents injection of arbitrary keys and ensures only well-known
attribute names reach the database.
"""

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
