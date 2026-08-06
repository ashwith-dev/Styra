"""Centralized configuration for the deterministic rule engine.

Extends constants from ``app/ai/utils/constants.py`` and rule tables from
``app/services/recommendations/rules.py``. No duplication — all new rules
live here; existing rules are imported.
"""

from typing import Optional

from app.services.recommendations.rules import (
    OUTFIT_CATEGORIES,
    CATEGORY_COMPATIBILITY,
    OCCASION_MAP,
    SEASON_WEIGHTS,
    _canonical_category,
    _parse_colour_name,
    _attr_value,
    _attr_confidence,
    _norm,
)

# ── Weather → material & layer preferences ──
# Each weather state maps to preferred material groups and layer guidance.

WEATHER_MATERIAL_PREFERENCES: dict[str, dict[str, list[str]]] = {
    "hot": {
        "prefer": [
            "cotton", "linen", "rayon", "viscose", "chambray", "seersucker",
            "bamboo", "modal", "mesh",
        ],
        "avoid": [
            "wool", "cashmere", "fleece", "velvet", "leather",
            "faux leather", "suede", "down",
        ],
        "max_layers": 1,
    },
    "warm": {
        "prefer": [
            "cotton", "linen", "rayon", "viscose", "chambray", "silk",
            "bamboo", "modal",
        ],
        "avoid": [
            "wool", "cashmere", "fleece", "down",
        ],
        "max_layers": 2,
    },
    "mild": {
        "prefer": [],
        "avoid": [],
        "max_layers": 3,
    },
    "cool": {
        "prefer": [
            "wool", "cashmere", "fleece", "knit", "flannel", "corduroy",
            "tweed",
        ],
        "avoid": ["linen", "mesh"],
        "max_layers": 3,
    },
    "cold": {
        "prefer": [
            "wool", "cashmere", "fleece", "down", "leather", "faux leather",
            "puffer", "quilted", "flannel", "corduroy",
        ],
        "avoid": ["linen", "mesh", "silk"],
        "max_layers": 4,
    },
}

# ── Season → item season value compatibility ──
# An item tagged with a season is kept if it matches. Items with no
# season data pass through but get a reduced priority marker.

SEASON_COMPATIBILITY: dict[str, set[str]] = {
    "spring": {"spring", "all_season", "summer"},
    "summer": {"summer", "all_season", "spring"},
    "fall": {"fall", "all_season", "winter"},
    "winter": {"winter", "all_season", "fall"},
}

SEASON_WARMTH_SCORES: dict[str, dict[str, float]] = {
    "spring": {"spring": 1.0, "all_season": 0.9, "summer": 0.7, "fall": 0.1, "winter": 0.0},
    "summer": {"summer": 1.0, "all_season": 0.9, "spring": 0.7, "fall": 0.1, "winter": 0.0},
    "fall": {"fall": 1.0, "all_season": 0.9, "spring": 0.5, "winter": 0.2, "summer": 0.0},
    "winter": {"winter": 1.0, "all_season": 0.9, "fall": 0.6, "spring": 0.1, "summer": 0.0},
}

# ── Occasion compatibility ──
# Each target occasion maps to compatible item-level occasion values.
# An item with no occasion data gets a neutral pass.

OCCASION_COMPATIBILITY: dict[str, set[str]] = {
    "casual": {"everyday", "travel", "loungewear", "college", "casual"},
    "formal": {"formal", "wedding", "wedding_guest", "business_formal"},
    "office": {"work", "everyday", "business_casual", "smart_casual"},
    "college": {"everyday", "college", "work", "casual"},
    "wedding": {"formal", "wedding", "wedding_guest", "festive"},
    "party": {"party", "formal", "festive", "night_out", "club"},
    "travel": {"travel", "everyday", "beach", "casual"},
    "gym": {"sport", "gym", "activewear"},
    "home": {"loungewear", "everyday", "casual"},
    "date": {"date_night", "party", "everyday", "smart_casual"},
    "festive": {"festive", "traditional", "wedding_guest", "formal"},
    "business_casual": {"work", "everyday", "business_casual", "smart_casual"},
    "smart_casual": {"everyday", "smart_casual", "date_night", "party"},
    "ethnic": {"traditional", "festive", "formal", "wedding"},
}

# ── Wardrobe gender categories ──
# Items tagged with a gender that doesn't match are excluded.
GENDER_COMPATIBILITY: dict[str, set[str]] = {
    "men": {"men", "unisex", None},
    "women": {"women", "unisex", None},
    "mixed": {"men", "women", "unisex", None},
}

# ── Category slot requirements ──
# Each outfit type must have exactly one item from each required slot.
# Optional slots are allowed but not required.
# Reuses OUTFIT_CATEGORIES from existing rules.py.

# ── Color harmony pair rules ──
# Explicit deterministic color pairings that always score high.

COLOR_PAIR_RULES: dict[str, list[tuple[str, str]]] = {
    "high_harmony": [
        ("black", "white"),
        ("black", "grey"),
        ("black", "gray"),
        ("black", "red"),
        ("black", "gold"),
        ("white", "blue"),
        ("white", "navy"),
        ("white", "red"),
        ("white", "black"),
        ("navy", "white"),
        ("navy", "beige"),
        ("navy", "cream"),
        ("navy", "grey"),
        ("navy", "gray"),
        ("blue", "white"),
        ("blue", "beige"),
        ("grey", "black"),
        ("grey", "white"),
        ("gray", "black"),
        ("gray", "white"),
        ("beige", "brown"),
        ("beige", "white"),
        ("beige", "navy"),
        ("beige", "olive"),
        ("brown", "beige"),
        ("brown", "cream"),
        ("brown", "olive"),
        ("olive", "black"),
        ("olive", "beige"),
        ("olive", "brown"),
    ],
}

# ── Material compatibility between items ──
# Some materials clash when worn together.

MATERIAL_COMPATIBILITY: dict[str, set[str]] = {
    "silk": {"silk", "cotton", "linen", "wool", "cashmere", "chiffon", "satin"},
    "leather": {"leather", "cotton", "denim", "knit", "wool", "cashmere"},
    "faux leather": {"faux leather", "cotton", "denim", "knit"},
    "denim": {"denim", "cotton", "knit", "leather", "faux leather"},
    "suede": {"suede", "cotton", "wool", "cashmere"},
    "velvet": {"velvet", "silk", "satin", "cotton"},
    "knit": {"knit", "cotton", "denim", "leather", "wool", "cashmere"},
    "lace": {"lace", "silk", "satin", "cotton", "chiffon"},
}

# ── Item-level type → occasion suitability ──
# Specific item types that are always/never suitable for an occasion.

ITEM_TYPE_OCCASION_RULES: dict[str, dict[str, dict[str, list[str]]]] = {
    "top": {
        "formal": {
            "suitable": [
                "dress shirt", "button-down shirt", "blouse", "silk blouse",
                "turtleneck", "polo shirt",
            ],
            "unsuitable": [
                "graphic tee", "tank top", "crop top", "hoodie",
                "sweatshirt", "jersey",
            ],
        },
        "gym": {
            "suitable": [
                "tank top", "t-shirt", "compression top", "sports bra",
            ],
            "unsuitable": [
                "dress shirt", "blouse", "silk blouse", "button-down shirt",
            ],
        },
        "office": {
            "suitable": [
                "dress shirt", "button-down shirt", "blouse", "polo shirt",
                "turtleneck", "sweater",
            ],
            "unsuitable": [
                "graphic tee", "tank top", "crop top", "hoodie",
            ],
        },
    },
    "bottom": {
        "formal": {
            "suitable": [
                "trousers", "chinos", "suit pants", "dress pants",
                "formal pants", "formal trousers", "slacks",
            ],
            "unsuitable": [
                "shorts", "joggers", "sweatpants", "track pants",
                "cargo pants", "ripped jeans", "jeans", "denim jeans",
                "blue jeans", "skinny jeans", "straight jeans",
                "distressed jeans",
            ],
        },
        "gym": {
            "suitable": [
                "shorts", "leggings", "joggers", "sweatpants",
            ],
            "unsuitable": [
                "trousers", "chinos", "suit pants", "dress pants",
            ],
        },
        "office": {
            "suitable": [
                "trousers", "chinos", "suit pants", "dress pants",
                "formal pants", "slacks",
            ],
            "unsuitable": [
                "shorts", "joggers", "sweatpants", "track pants",
                "ripped jeans",
            ],
        },
    },
    "footwear": {
        "formal": {
            "suitable": ["oxfords", "loafers", "heels", "pumps", "chelsea boots"],
            "unsuitable": ["sneakers", "running shoes", "sandals", "slippers", "flip flops"],
        },
        "gym": {
            "suitable": ["running shoes", "sneakers", "training shoes"],
            "unsuitable": ["oxfords", "loafers", "heels", "pumps", "sandals", "boots"],
        },
        "office": {
            "suitable": ["oxfords", "loafers", "flats", "chelsea boots", "heels"],
            "unsuitable": ["sneakers", "running shoes", "slippers", "flip flops"],
        },
    },
    "outerwear": {
        "gym": {
            "unsuitable": [
                "blazer", "suit jacket", "trench coat", "leather jacket",
                "pea coat",
            ],
        },
        "formal": {
            "suitable": [
                "blazer", "suit jacket", "trench coat", "overcoat", "pea coat",
            ],
            "unsuitable": ["hoodie", "bomber jacket", "windbreaker"],
        },
    },
}
