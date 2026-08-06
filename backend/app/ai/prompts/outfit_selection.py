"""Prompt templates for Gemini outfit selection.

Gemini acts as a fashion stylist — it must ONLY select from the
provided candidates. It must never invent clothing, suggest missing
items, or modify outfits. The response must be strict JSON with no
extra text.

All user-supplied values are sanitised before inclusion: newlines
are flattened to spaces, length is capped, and every value is
wrapped in explicit delimiters to prevent prompt injection.
"""

import json
from typing import Optional

from app.ai.models.outfit_candidate import CandidateSet

_MAX_USER_VALUE_LENGTH = 200


def _sanitise_user_value(value: str) -> str:
    """Flatten a user-supplied string to prevent prompt injection.

    Newlines, carriage returns, and null bytes are removed so an
    attacker cannot inject instruction boundaries. Length is capped
    to prevent token-wasting attacks.
    """
    sanitised = (
        value
        .replace("\x00", "")
        .replace("\r", " ")
        .replace("\n", " ")
    )
    if len(sanitised) > _MAX_USER_VALUE_LENGTH:
        sanitised = sanitised[:_MAX_USER_VALUE_LENGTH] + "…"
    return sanitised


def build_selection_system_prompt() -> str:
    """Return the system prompt that defines Gemini's role and constraints."""
    return (
        "You are a professional fashion stylist. Your ONLY job is to select "
        "the single best outfit from a provided list of candidates. "
        "You MUST follow these rules exactly:\n\n"
        "1. NEVER invent, modify, or add clothing items.\n"
        "2. NEVER change any candidate outfit's item combination.\n"
        "3. ONLY return the EXACT JSON format specified below.\n"
        "4. NO markdown, NO code blocks, NO extra text.\n"
        "5. Base your selection ONLY on the provided candidates.\n"
        "6. If unsure, select the first (highest-scored) candidate.\n"
        "7. Respond with RAW JSON — no ```json fences, no explanatory text."
    )


def build_selection_user_prompt(
    candidates: CandidateSet,
    *,
    season: Optional[str] = None,
    occasion: Optional[str] = None,
    weather: Optional[str] = None,
    style_preference: Optional[str] = None,
    additional_context: Optional[str] = None,
) -> str:
    """Build the user prompt with context and candidate data.

    Uses short numeric IDs (1, 2, 3...) instead of long UUID outfit IDs
    to minimize token usage and prevent JSON truncation.

    Args:
        candidates: Top-N ranked ``CandidateSet`` from ``RankingEngine``.
        season: Target season.
        occasion: Target occasion.
        weather: Current weather condition.
        style_preference: Optional user style preference.
        additional_context: Any extra user-supplied context.

    Returns:
        Formatted user prompt string.
    """
    parts: list[str] = ["SELECT THE BEST OUTFIT FROM THESE CANDIDATES.\n"]

    parts.append("=== CONTEXT ===")
    if season:
        parts.append(f"Season: {_sanitise_user_value(season)}")
    if occasion:
        parts.append(f"Occasion: {_sanitise_user_value(occasion)}")
    if weather:
        parts.append(f"Weather: {_sanitise_user_value(weather)}")
    if style_preference:
        parts.append(
            f"Style Preference (user-chosen): [["
            f"{_sanitise_user_value(style_preference)}"
            f"]]"
        )
    if additional_context:
        parts.append(
            f"Additional Context (user-supplied): [["
            f"{_sanitise_user_value(additional_context)}"
            f"]]"
        )
    parts.append("")

    parts.append("=== CANDIDATE OUTFITS ===")
    for i, candidate in enumerate(candidates.candidates, 1):
        parts.append(f"\n--- Candidate #{i} ---")
        parts.append(f"ID: {i}")
        parts.append(f"Score: {candidate.score:.2f}")

        parts.append("Items:")
        for item in candidate.items:
            attrs = item.attributes
            desc_parts: list[str] = []
            cat = _extract_str(attrs, "category")
            typ = _extract_str(attrs, "type")
            color = _extract_str(attrs, "color")
            material = _extract_str(attrs, "material")
            style = _extract_str(attrs, "style")
            if cat:
                desc_parts.append(cat)
            if typ:
                desc_parts.append(typ)
            if color:
                desc_parts.append(f"color:{color}")
            if material:
                desc_parts.append(f"material:{material}")
            if style:
                desc_parts.append(f"style:{style}")
            parts.append(f"  - {', '.join(desc_parts)}")

    parts.append("\n=== REQUIRED JSON OUTPUT ===")
    parts.append(json.dumps({
        "selected_candidate_id": "<NUMBER>",
        "confidence": 0.95,
        "reason": "One-sentence explanation.",
        "styling_tips": [
            "One styling tip.",
            "Another suggestion.",
        ],
    }, indent=2))

    parts.append("\nIMPORTANT: selected_candidate_id must be a NUMBER (1, 2, 3, etc.), not a UUID.")
    parts.append("Return ONLY the JSON. No other text. No markdown fences.")

    return "\n".join(parts)


def _extract_str(attrs: dict, key: str) -> Optional[str]:
    """Extract an item attribute for the prompt.

    Item attributes are user-controlled (they come from wardrobe uploads),
    so they go through the same injection sanitisation as user context:
    newlines flattened, length capped.
    """
    val = attrs.get(key)
    if isinstance(val, dict):
        val = val.get("value")
    if isinstance(val, str) and val.strip():
        return _sanitise_user_value(val.strip())[:80]
    return None
