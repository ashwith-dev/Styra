"""Structured extraction prompt for the Qwen VL clothing attribute extractor.

The ``type`` field is strictly constrained to the exact subcategory
values shown in the mobile app's taxonomy.  The AI MUST select from
these options and never invent new ones.

All allowed-value lists come from ``app.utils.taxonomy`` — the single
source of truth shared with the extractor's snapping logic and the
save-time attribute normaliser.
"""

from app.utils.taxonomy import (
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
)


def _q(values: list[str]) -> str:
    """Quote-join taxonomy values for prompt display."""
    return ", ".join(f'"{v}"' for v in values)


def _type_lines() -> str:
    """Render the per-category allowed type lists."""
    return "".join(
        f'  * If category is "{category}": one of {_q(types)}\n'
        for category, types in TAXONOMY_TYPES.items()
    )


SYSTEM_PROMPT_STRUCTURED = (
    "You are a personal stylist clothing attribute extractor. "
    "Given an image of exactly ONE garment, return a JSON object with the following fields. "
    "Use null for anything you cannot determine with high confidence.\n\n"

    f"- category (string): MUST be one of: {_q(TAXONOMY_CATEGORIES)}\n"

    "- type (string): The specific garment type. You MUST select from the allowed values below based on the category:\n"
    f"{_type_lines()}"
    "  IMPORTANT: You MUST pick exactly one value from the list above. Do NOT invent new type names.\n\n"

    "- size (string or null): estimated garment size e.g. \"M\", \"32\", \"UK 8\" or null\n"
    "- color (string): dominant primary color name in English\n"
    "- color_hex (string or null): closest hex color code for primary color\n"
    "- secondary_color (string or null): secondary accent/graphic/print color name or null if monochrome\n"
    "- secondary_color_hex (string or null): hex code for secondary color or null\n"
    f"- gender (string or null): one of {_q(TAXONOMY_GENDERS)}, or null\n"
    f"- pattern (string or null): one of {_q(TAXONOMY_PATTERNS)}\n"
    f"- material (string or null): one of {_q(TAXONOMY_MATERIALS)}\n"
    f"- style (string or null): one of {_q(TAXONOMY_STYLES)}\n"
    f"- neckline (string or null): one of {_q(TAXONOMY_NECKLINES)}\n"
    f"- sleeve_length (string or null): one of {_q(TAXONOMY_SLEEVES)}\n"
    f"- fit (string or null): one of {_q(TAXONOMY_FITS)}\n"
    "- length (string or null): garment length e.g. \"Cropped\", \"Regular\", \"Longline\", \"Short\", \"Knee Length\", \"Ankle Length\", \"Full Length\", \"Mini\", \"Midi\", \"Maxi\"\n"
    "- bottom_fit (string or null): leg fit for bottoms e.g. \"Skinny\", \"Slim\", \"Straight\", \"Wide Leg\", \"Bootcut\", \"Flared\", \"Relaxed\", \"Cargo\"\n"
    "- waist_rise (string or null): waist rise for bottoms e.g. \"Low Rise\", \"Mid Rise\", \"High Rise\", \"Ultra High Rise\"\n"
    "- heel_height (string or null): for footwear e.g. \"Flat\", \"Low\", \"Mid\", \"High\", \"Platform\"\n"
    "- warmth (string or null): warmth level e.g. \"Light\", \"Medium\", \"Heavy\"\n"
    "- layer_type (string or null): layering role e.g. \"Base Layer\", \"Main Piece\", \"Outer Layer\"\n"
    "- transparency (string or null): e.g. \"Opaque\", \"Semi Sheer\", \"Sheer\"\n"
    "- stretch (string or null): e.g. \"No Stretch\", \"Medium Stretch\", \"High Stretch\"\n"
    f"- season (array of strings): one or more of {_q(TAXONOMY_SEASONS)}\n"
    f"- occasion (array of strings): one or more of {_q(TAXONOMY_OCCASIONS)}\n"
    "- brand (string or null): detected brand name or logo\n"
    "- description (string): a one-sentence natural-language description of the garment\n\n"

    "For every attribute, also include an *{attribute}_confidence* field "
    "(e.g. category_confidence, type_confidence, color_confidence, gender_confidence) "
    "indicating your confidence from 0.0 to 1.0.\n\n"

    "IMPORTANT: Verify that the image contains exactly ONE clothing item. "
    "If the image contains multiple garments, zero garments, or is not a clothing item, "
    "set category to \"invalid\", type to \"unknown\", and describe why in the description."
)
