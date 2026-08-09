"""Deterministic rule sets for outfit recommendations.

Colour harmony, style compatibility, occasion mapping, and season
suitability are defined here so the engine stays purely rule-based.
"""

import re
from typing import Optional

# ── Outfit categories mapped to required slots ──
# Each outfit category requires one item per category slot.
# "nullable" means the slot is optional (outfit is valid without it).
OUTFIT_CATEGORIES: dict[str, dict[str, bool]] = {
    "casual": {
        "top": False,
        "bottom": False,
        "footwear": False,
        "outerwear": True,
        "accessory": True,
    },
    "formal": {
        "top": False,
        "bottom": False,
        "footwear": False,
        "outerwear": True,
        "accessory": True,
        "dress": True,
    },
    "office": {
        "top": False,
        "bottom": False,
        "footwear": False,
        "outerwear": True,
        "accessory": True,
    },
    "college": {
        "top": False,
        "bottom": False,
        "footwear": False,
        "outerwear": True,
        "accessory": True,
    },
    "party": {
        "top": False,
        "bottom": False,
        "footwear": False,
        "outerwear": True,
        "accessory": True,
        "dress": True,
    },
    "date_night": {
        "top": False,
        "bottom": False,
        "footwear": False,
        "outerwear": True,
        "accessory": True,
        "dress": True,
    },
    "travel": {
        "top": False,
        "bottom": False,
        "footwear": False,
        "outerwear": True,
        "accessory": True,
    },
    "gym": {
        "top": False,
        "bottom": False,
        "footwear": False,
        "accessory": True,
    },
    "ethnic": {
        "top": False,
        "bottom": False,
        "footwear": False,
        "accessory": True,
        "dress": True,
    },
}

# ── Category compatibility (which categories work together) ──
# Mirrors the existing _compatible_categories for backward compat.
CATEGORY_COMPATIBILITY: dict[str, list[str]] = {
    "top": ["bottom", "outerwear", "accessory"],
    "bottom": ["top", "outerwear", "footwear", "accessory"],
    "dress": ["outerwear", "footwear", "accessory"],
    "outerwear": ["top", "bottom", "dress", "accessory"],
    "footwear": ["bottom", "dress", "outerwear"],
    "accessory": ["top", "bottom", "dress", "outerwear"],
}


# ── Colour helpers ──


def _parse_colour_name(name: str) -> str:
    """Normalise a colour name to a base hue group."""
    name = (name or "").strip().lower()
    mapping = {
        "red": "warm",
        "crimson": "warm",
        "maroon": "warm",
        "burgundy": "warm",
        "scarlet": "warm",
        "pink": "warm",
        "rose": "warm",
        "salmon": "warm",
        "coral": "warm",
        "orange": "warm",
        "peach": "warm",
        "tangerine": "warm",
        "yellow": "warm",
        "gold": "warm",
        "mustard": "warm",
        "amber": "warm",
        "cream": "warm",
        "beige": "warm",
        "tan": "warm",
        "brown": "warm",
        "chocolate": "warm",
        "copper": "warm",
        "rust": "warm",
        "camel": "warm",
        "khaki": "warm",
        "olive": "warm",
        "blue": "cool",
        "navy": "cool",
        "teal": "cool",
        "cyan": "cool",
        "turquoise": "cool",
        "sky": "cool",
        "indigo": "cool",
        "royal blue": "cool",
        "purple": "cool",
        "violet": "cool",
        "lavender": "cool",
        "mauve": "cool",
        "plum": "cool",
        "lilac": "cool",
        "green": "cool",
        "emerald": "cool",
        "mint": "cool",
        "sage": "cool",
        "forest": "cool",
        "white": "neutral",
        "black": "neutral",
        "grey": "neutral",
        "gray": "neutral",
        "charcoal": "neutral",
        "silver": "neutral",
        "ivory": "neutral",
        "off-white": "neutral",
        "ecru": "neutral",
        "taupe": "neutral",
        "heather": "neutral",
        "denim": "cool",
        "multi": "neutral",
    }
    return mapping.get(name, "neutral")


class ColourHarmony:
    """Deterministic colour harmony rules (no LLM)."""

    @staticmethod
    def score(colours: list[str]) -> float:
        """Score a set of colours for harmony, 0.0–1.0."""
        if len(colours) <= 1:
            return 1.0

        groups = [_parse_colour_name(c) for c in colours]

        warm_count = groups.count("warm")
        cool_count = groups.count("cool")
        neutral_count = groups.count("neutral")

        # All neutral: good with anything
        neutral_ratio = neutral_count / len(groups)
        if neutral_ratio >= 0.5:
            return 0.9 + (0.1 * neutral_ratio)

        # All warm or all cool: good harmony
        if warm_count == len(groups) - neutral_count:
            return 0.85
        if cool_count == len(groups) - neutral_count:
            return 0.85

        # Mixed warm + cool: clashing
        mix_ratio = (warm_count + cool_count) / len(groups)
        if warm_count > 0 and cool_count > 0:
            return max(0.4, 1.0 - (mix_ratio * 0.5))

        return 0.75


class StyleCompatibility:
    """Deterministic style compatibility rules."""

    # Aesthetic styles plus the occasion-like style vocabulary the extractor
    # emits ("Smart Casual", "Office", "Gym"...). Mappings are symmetric so
    # pair order doesn't matter in score().
    _COMPATIBLE: dict[str, set[str]] = {
        "casual": {"casual", "minimalist", "sporty", "athleisure", "streetwear", "bohemian",
                   "smart_casual", "college", "travel", "beach", "lounge"},
        "formal": {"formal", "minimalist", "vintage", "preppy", "romantic",
                   "business_casual", "office", "wedding"},
        "sporty": {"casual", "sporty", "athleisure", "streetwear", "gym", "college", "travel"},
        "bohemian": {"casual", "bohemian", "vintage", "romantic", "beach", "festive"},
        "minimalist": {"minimalist", "casual", "formal", "preppy", "sporty",
                       "smart_casual", "business_casual", "office", "date_night"},
        "vintage": {"vintage", "bohemian", "romantic", "preppy", "formal", "wedding", "festive"},
        "edgy": {"edgy", "streetwear", "casual", "party"},
        "preppy": {"preppy", "formal", "minimalist", "casual",
                   "smart_casual", "business_casual", "office", "college"},
        "romantic": {"romantic", "bohemian", "vintage", "formal", "date_night", "wedding", "festive"},
        "athleisure": {"athleisure", "casual", "sporty", "streetwear", "gym", "travel", "lounge"},
        "streetwear": {"streetwear", "casual", "edgy", "sporty", "athleisure",
                       "college", "party", "travel"},
        "smart_casual": {"smart_casual", "casual", "minimalist", "preppy", "business_casual",
                         "office", "college", "date_night"},
        "business_casual": {"business_casual", "smart_casual", "formal", "minimalist",
                            "preppy", "office"},
        "office": {"office", "business_casual", "smart_casual", "formal", "minimalist", "preppy"},
        "college": {"college", "casual", "streetwear", "sporty", "smart_casual", "preppy"},
        "party": {"party", "edgy", "streetwear", "date_night", "festive", "wedding"},
        "wedding": {"wedding", "formal", "romantic", "vintage", "festive", "party"},
        "festive": {"festive", "wedding", "party", "bohemian", "romantic", "vintage"},
        "date_night": {"date_night", "romantic", "smart_casual", "party", "minimalist"},
        "travel": {"travel", "casual", "sporty", "athleisure", "streetwear", "beach"},
        "beach": {"beach", "casual", "bohemian", "travel", "lounge"},
        "gym": {"gym", "sporty", "athleisure"},
        "lounge": {"lounge", "casual", "athleisure", "beach"},
    }

    @staticmethod
    def score(styles: list[str]) -> float:
        """Score a set of styles for compatibility, 0.0–1.0."""
        if len(styles) <= 1:
            return 1.0

        compat_scores: list[float] = []
        for i, s1 in enumerate(styles):
            for s2 in styles[i + 1:]:
                if s2 in StyleCompatibility._COMPATIBLE.get(s1, set()):
                    compat_scores.append(1.0)
                else:
                    compat_scores.append(0.3)

        if not compat_scores:
            return 0.5
        return sum(compat_scores) / len(compat_scores)


# ── Occasion mapping (outfit category → acceptable item occasion values) ──

OCCASION_MAP: dict[str, list[str]] = {
    # Item-side values are taxonomy-snapped occasions (normalised), so
    # "casual"/"smart_casual" must appear here — they are the most common
    # tags produced by the extraction pipeline.
    "casual": ["casual", "everyday", "travel", "loungewear"],
    "formal": ["formal", "wedding_guest", "smart_casual"],
    "office": ["work", "everyday", "smart_casual"],
    "college": ["everyday", "work", "casual"],
    "party": ["party", "formal", "festival", "smart_casual"],
    "date_night": ["date_night", "party", "everyday"],
    "travel": ["travel", "everyday", "beach", "casual"],
    "gym": ["sport"],
    "ethnic": ["festival", "wedding_guest", "formal"],
}


# ── Season map (outfit category → suitable seasons) ──

SEASON_WEIGHTS: dict[str, dict[str, float]] = {
    "casual": {"spring": 1.0, "summer": 1.0, "fall": 1.0, "winter": 1.0},
    "formal": {"spring": 1.0, "summer": 1.0, "fall": 1.0, "winter": 1.0},
    "office": {"spring": 1.0, "summer": 1.0, "fall": 1.0, "winter": 1.0},
    "college": {"spring": 1.0, "summer": 1.0, "fall": 1.0, "winter": 1.0},
    "party": {"spring": 1.0, "summer": 1.0, "fall": 1.0, "winter": 1.0},
    "date_night": {"spring": 1.0, "summer": 1.0, "fall": 1.0, "winter": 1.0},
    "travel": {"spring": 1.0, "summer": 1.0, "fall": 1.0, "winter": 1.0},
    "gym": {"spring": 1.0, "summer": 1.0, "fall": 1.0, "winter": 1.0},
    "ethnic": {"spring": 1.0, "summer": 1.0, "fall": 1.0, "winter": 1.0},
}


# ── Explanation templates ──

EXPLANATION_TEMPLATES: dict[str, list[str]] = {
    "casual": [
        "Relaxed pieces that work for everyday wear.",
        "Comfortable, easygoing combination.",
        "Perfect for a casual day out.",
    ],
    "formal": [
        "Polished, sophisticated pairing.",
        "Formal pieces that complement each other.",
        "Elegant combination for formal occasions.",
    ],
    "office": [
        "Professional pieces suitable for the workplace.",
        "Smart, office-appropriate combination.",
        "Clean, work-ready outfit.",
    ],
    "college": [
        "Stylish yet practical for campus life.",
        "Suitable for a casual college day.",
        "Comfortable and trendy for classes.",
    ],
    "party": [
        "Bold pieces that stand out at any party.",
        "Fun, eye-catching combination.",
        "Ready for a night out.",
    ],
    "date_night": [
        "Stylish and romantic pairing.",
        "Perfect for a special evening.",
        "Thoughtfully coordinated for date night.",
    ],
    "travel": [
        "Versatile pieces ideal for travel.",
        "Comfortable and practical for on the go.",
        "Packed and ready — great travel outfit.",
    ],
    "gym": [
        "Performance-ready gym combination.",
        "Breathable, movement-friendly pieces.",
        "Functional workout outfit.",
    ],
    "ethnic": [
        "Traditional pieces paired with care.",
        "Culturally styled combination.",
        "Festive ethnic outfit.",
    ],
}

COLOUR_HARMONY_EXPLANATIONS: list[str] = [
    "Colours in the same family create a cohesive look.",
    "Neutral colours work well together.",
    "The colour palette is well balanced.",
    "Complementary tones that work together.",
]

STYLE_EXPLANATIONS: list[str] = [
    "Styles blend naturally for a cohesive look.",
    "The style language is consistent throughout.",
    "These pieces share a common aesthetic.",
]

SEASON_EXPLANATIONS: dict[str, str] = {
    "spring": "Light layers ideal for spring weather.",
    "summer": "Lightweight fabrics recommended for summer.",
    "fall": "Warm layers suited for autumn.",
    "winter": "Cold-weather pieces for winter comfort.",
}

OCCASION_EXPLANATIONS: dict[str, str] = {
    "casual": "Casual pieces for everyday comfort.",
    "formal": "Formal items that dress up the outfit.",
    "office": "Work-appropriate selections.",
    "college": "Campus-ready styling.",
    "party": "Party-ready pieces.",
    "date_night": "Date night elegance.",
    "travel": "Travel-friendly picks.",
    "gym": "Gym-ready gear.",
    "ethnic": "Ethnic wear styled with care.",
}


_NORM_ALIASES: dict[str, str] = {
    "autumn": "fall",
}


def _norm(value: str) -> str:
    """Normalise an attribute value for rule lookups.

    The extraction model returns display-case values ("Summer", "Date Night")
    and parenthesised variants ("Dress Shirt (Formal)") while the rule tables
    are lowercase snake_case — comparisons must go through this or they
    silently never match. Parenthetical qualifiers are dropped and known
    synonyms (e.g. "Autumn") are aliased to their canonical key.
    """
    v = re.sub(r"\([^)]*\)", "", value)
    v = v.strip().lower().replace(" ", "_").replace("-", "_")
    v = re.sub(r"_+", "_", v).strip("_")
    return _NORM_ALIASES.get(v, v)


# Map every category the extractor / mobile taxonomy can produce onto the
# six wardrobe slots the engine understands. Full-body categories (suit,
# traditional, ethnic, jumpsuit) fill the dress slot: like a dress, they
# replace the top+bottom pair in an outfit.
_CATEGORY_CANONICAL: dict[str, str] = {
    "top": "top",
    "tops": "top",
    "activewear": "top",
    "bottom": "bottom",
    "bottoms": "bottom",
    "dress": "dress",
    "dresses": "dress",
    "jumpsuit": "dress",
    "jumpsuits": "dress",
    "suit": "dress",
    "suits": "dress",
    "traditional": "dress",
    "ethnic": "dress",
    "outerwear": "outerwear",
    "footwear": "footwear",
    "accessory": "accessory",
    "accessories": "accessory",
}


# Activewear garment types that belong in the bottom slot (gym shorts and
# leggings are not tops — without this a gym outfit could be two "tops").
_ACTIVEWEAR_BOTTOM_TYPES = frozenset({
    "shorts", "training_shorts", "running_shorts", "leggings",
    "track_pants", "joggers", "sweatpants", "yoga_pants",
})


def _canonical_category(
    value: Optional[str],
    type_value: Optional[str] = None,
) -> Optional[str]:
    """Return the engine wardrobe slot for a raw category value, or None.

    ``activewear`` is disambiguated by garment type when provided:
    bottom-style pieces (shorts, leggings, track pants…) map to
    ``bottom``; everything else stays ``top``.
    """
    if not value:
        return None
    normed = _norm(value)
    slot = _CATEGORY_CANONICAL.get(normed)
    if slot == "top" and normed == "activewear" and type_value:
        if _norm(type_value) in _ACTIVEWEAR_BOTTOM_TYPES:
            return "bottom"
    return slot


def _attr_value(attributes: dict, key: str) -> Optional[str]:
    if isinstance(attributes.get(key), dict):
        val = attributes[key].get("value")
        return val if isinstance(val, str) and val.strip() else None
    if isinstance(attributes.get(key), str):
        return attributes[key].strip() or None
    return None


def _attr_confidence(attributes: dict, key: str, default: float = 0.5) -> float:
    if isinstance(attributes.get(key), dict):
        c = attributes[key].get("confidence")
        if c is not None:
            try:
                return float(c)
            except (TypeError, ValueError):
                # A poisoned row (non-numeric confidence) must not crash
                # scoring for the whole wardrobe.
                return default
    return default


def _list_values(attributes: dict, key: str) -> list[str]:
    entries = attributes.get(key) or []
    if not isinstance(entries, list):
        return []
    values: list[str] = []
    for entry in entries:
        val = _attr_value({"v": entry}, "v") if isinstance(entry, dict) else str(entry)
        if val:
            values.append(val)
    return values
