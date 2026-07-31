"""Taxonomy definitions and prompt helpers for Qwen attribute extraction."""

TAXONOMY_CATEGORIES = {
    "top": [
        "T-Shirt", "Polo Shirt", "Shirt", "Dress Shirt", "Blouse", "Crop Top",
        "Camisole", "Tunic", "Bodysuit", "Kurti", "Hoodie", "Sweatshirt",
        "Sweater", "Cardigan", "Vest", "Tank Top", "Henley"
    ],
    "bottom": [
        "Jeans", "Trousers", "Chinos", "Shorts", "Cargo Pants", "Joggers",
        "Sweatpants", "Track Pants", "Skirt", "Leggings", "Palazzo", "Culottes"
    ],
    "dress": [
        "Mini Dress", "Midi Dress", "Maxi Dress", "Bodycon Dress", "Wrap Dress",
        "Shirt Dress", "A-Line Dress", "Gown", "Slip Dress", "Jumpsuit", "Romper"
    ],
    "outerwear": [
        "Denim Jacket", "Leather Jacket", "Bomber Jacket", "Blazer", "Suit Jacket",
        "Coat", "Trench Coat", "Puffer Jacket", "Windbreaker", "Cardigan"
    ],
    "footwear": [
        "Sneakers", "Running Shoes", "Boots", "Chelsea Boots", "Loafers",
        "Oxfords", "Heels", "Pumps", "Flats", "Sandals", "Wedges", "Slippers"
    ],
    "accessory": [
        "Cap", "Hat", "Belt", "Tie", "Bow Tie", "Scarf", "Gloves", "Watch",
        "Sunglasses", "Handbag", "Tote Bag", "Clutch", "Backpack", "Jewellery"
    ]
}

TAXONOMY_MATERIALS = [
    "Cotton", "Linen", "Denim", "Polyester", "Wool", "Silk", "Satin", "Leather",
    "Faux Leather", "Suede", "Velvet", "Nylon", "Rayon", "Viscose", "Cashmere",
    "Chiffon", "Georgette", "Lace", "Knit"
]

TAXONOMY_PATTERNS = [
    "Solid", "Graphic", "Printed", "Floral", "Striped", "Checked", "Plaid",
    "Polka Dot", "Paisley", "Animal Print", "Abstract", "Geometric", "Tie Dye", "Textured"
]

TAXONOMY_FITS = ["Slim", "Regular", "Relaxed", "Loose", "Oversized", "Tailored", "Straight", "Bodycon"]

TAXONOMY_NECKLINES = [
    "Crew Neck", "Round Neck", "V Neck", "U Neck", "Square Neck", "Boat Neck",
    "Scoop Neck", "Sweetheart", "High Neck", "Mock Neck", "Turtleneck", "Halter",
    "Off Shoulder", "Collared"
]

TAXONOMY_SLEEVES = ["Sleeveless", "Cap Sleeve", "Short", "Half", "Three Quarter", "Long", "Bell Sleeve", "Puff Sleeve"]
