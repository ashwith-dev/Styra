"""Single source of truth for the clothing attribute taxonomy.

Imported by the extraction prompt builder (``app.utils.prompts``), the
Qwen extractor's type snapping, and save-time attribute normalisation —
so the model, the validator, and the outfit engines always agree on
allowed values. Values are canonical display-case; rule engines
normalise via ``_norm`` before comparing, so display case here is safe.
"""

TAXONOMY_CATEGORIES: list[str] = [
    "top", "bottom", "dress", "outerwear", "suit", "traditional",
    "ethnic", "activewear", "footwear", "accessory",
]

TAXONOMY_TYPES: dict[str, list[str]] = {
    "top": [
        "T-Shirt", "Polo Shirt", "Shirt (Casual)", "Dress Shirt (Formal)",
        "Henley", "Hoodie", "Sweatshirt", "Sweater", "Cardigan", "Vest",
        "Tank Top", "Jersey", "Blouse", "Crop Top", "Camisole", "Tunic",
        "Bodysuit", "Kurti", "Peplum Top", "Off Shoulder Top",
    ],
    "bottom": [
        "Jeans", "Trousers", "Chinos", "Shorts", "Cargo Pants", "Joggers",
        "Sweatpants", "Track Pants", "Linen Pants", "Leggings", "Jeggings",
        "Skirt", "Mini Skirt", "Midi Skirt", "Maxi Skirt", "Palazzo",
        "Culottes", "Salwar",
    ],
    "dress": [
        "Mini Dress", "Midi Dress", "Maxi Dress", "Bodycon Dress",
        "Wrap Dress", "Shirt Dress", "A-Line Dress", "Shift Dress",
        "Gown", "Slip Dress",
    ],
    "outerwear": [
        "Denim Jacket", "Bomber Jacket", "Leather Jacket", "Blazer",
        "Suit Jacket", "Coat", "Trench Coat", "Puffer Jacket",
        "Windbreaker", "Rain Jacket", "Fleece Jacket", "Cardigan", "Shrug",
    ],
    "suit": ["Two Piece Suit", "Three Piece Suit", "Tuxedo"],
    "traditional": [
        "Kurta", "Sherwani", "Nehru Jacket", "Dhoti", "Pajama", "Kurta Set",
    ],
    "ethnic": [
        "Saree", "Lehenga", "Kurta", "Kurti", "Salwar Suit", "Dupatta", "Blouse",
    ],
    "activewear": [
        "Gym T-Shirt", "Compression Shirt", "Training Shorts",
        "Running Shorts", "Track Pants", "Sports Jacket", "Sports Bra",
        "Gym Top", "Leggings", "Yoga Pants",
    ],
    "footwear": [
        "Sneakers", "Running Shoes", "Trainers", "Boots", "Chelsea Boots",
        "Loafers", "Oxfords", "Derbies", "Sandals", "Slippers", "Flip Flops",
        "Flats", "Heels", "Pumps", "Wedges",
    ],
    "accessory": [
        "Cap", "Hat", "Belt", "Tie", "Bow Tie", "Scarf", "Gloves",
        "Watch", "Sunglasses", "Wallet", "Backpack", "Handbag",
        "Tote Bag", "Clutch", "Jewellery",
    ],
}

TAXONOMY_MATERIALS: list[str] = [
    "Cotton", "Linen", "Denim", "Polyester", "Wool", "Silk", "Satin",
    "Leather", "Faux Leather", "Suede", "Velvet", "Nylon", "Rayon",
    "Viscose", "Cashmere", "Chiffon", "Georgette", "Lace", "Knit",
]

TAXONOMY_PATTERNS: list[str] = [
    "Solid", "Graphic", "Printed", "Floral", "Striped", "Checked", "Plaid",
    "Polka Dot", "Paisley", "Animal Print", "Abstract", "Geometric",
    "Tie Dye", "Textured",
]

TAXONOMY_STYLES: list[str] = [
    "Casual", "Smart Casual", "Business Casual", "Formal", "Party",
    "Wedding", "Festive", "Office", "College", "Date Night", "Travel",
    "Beach", "Gym", "Lounge",
]

TAXONOMY_FITS: list[str] = [
    "Slim", "Regular", "Relaxed", "Loose", "Oversized", "Tailored",
    "Straight", "Bodycon",
]

TAXONOMY_NECKLINES: list[str] = [
    "Crew Neck", "Round Neck", "V Neck", "U Neck", "Square Neck",
    "Boat Neck", "Scoop Neck", "Sweetheart", "High Neck", "Mock Neck",
    "Turtleneck", "Halter", "Off Shoulder", "Collared",
]

TAXONOMY_SLEEVES: list[str] = [
    "Sleeveless", "Cap Sleeve", "Short", "Half", "Three Quarter", "Long",
    "Bell Sleeve", "Puff Sleeve",
]

TAXONOMY_SEASONS: list[str] = [
    "Summer", "Winter", "Spring", "Autumn", "All Season",
]

# "Everyday" is included alongside the prompt's occasion vocabulary: the
# engine compatibility tables reference it heavily (casual, office,
# college, travel, home all admit it) and the visual heuristic fallback
# emits it — without it here those items would be dropped at validation.
TAXONOMY_OCCASIONS: list[str] = [
    "Casual", "Smart Casual", "Work", "Party", "Formal", "Sport",
    "Travel", "Date Night", "Loungewear", "Everyday",
]

# Client-side occasion vocabulary with no canonical counterpart — mapped to
# the closest canonical occasion before snapping, so user selections are
# preserved instead of being silently dropped at save time.
OCCASION_ALIASES: dict[str, str] = {
    "workwear": "Work",
    "office": "Work",
    "business casual": "Smart Casual",
    "evening": "Party",
    "festive": "Party",
    "wedding": "Formal",
    "sportswear": "Sport",
    "gym": "Sport",
    "college": "Casual",
    "beach": "Travel",
    "home": "Loungewear",
    "lounge": "Loungewear",
}

TAXONOMY_GENDERS: list[str] = ["men", "women", "unisex"]

# Flat union of every per-category type list (order preserved).
ALL_TYPES: list[str] = [
    t for types in TAXONOMY_TYPES.values() for t in types
]


def snap_to_taxonomy(value: str | None, allowed: list[str]) -> str | None:
    """Snap *value* to the canonical taxonomy form in *allowed*.

    Case-insensitive exact match only. Returns the canonical
    (display-case) entry, or ``None`` when nothing matches — callers
    must drop the attribute rather than substitute an invented value.
    """
    if not value:
        return None
    needle = value.strip().lower()
    if not needle or needle == "unknown":
        return None
    for entry in allowed:
        if entry.lower() == needle:
            return entry
    return None
