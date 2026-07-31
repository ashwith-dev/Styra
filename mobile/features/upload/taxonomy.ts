export type WardrobeType = "men" | "women" | "mixed";

export interface CategoryDef {
  id: string;
  name: string;
  subcategories: string[];
}

// Full Taxonomy Configuration for Men, Women, and Mixed Wardrobes
export const MEN_CATEGORIES: CategoryDef[] = [
  {
    id: "top",
    name: "Tops",
    subcategories: [
      "T-Shirt",
      "Polo Shirt",
      "Shirt (Casual)",
      "Dress Shirt (Formal)",
      "Henley",
      "Hoodie",
      "Sweatshirt",
      "Sweater",
      "Cardigan",
      "Vest",
      "Tank Top",
      "Jersey",
    ],
  },
  {
    id: "bottom",
    name: "Bottoms",
    subcategories: [
      "Jeans",
      "Trousers",
      "Chinos",
      "Shorts",
      "Cargo Pants",
      "Joggers",
      "Sweatpants",
      "Track Pants",
      "Linen Pants",
    ],
  },
  {
    id: "outerwear",
    name: "Outerwear",
    subcategories: [
      "Denim Jacket",
      "Bomber Jacket",
      "Leather Jacket",
      "Blazer",
      "Suit Jacket",
      "Coat",
      "Trench Coat",
      "Puffer Jacket",
      "Windbreaker",
      "Rain Jacket",
      "Fleece Jacket",
    ],
  },
  {
    id: "suit",
    name: "Suits",
    subcategories: ["Two Piece Suit", "Three Piece Suit", "Tuxedo"],
  },
  {
    id: "traditional",
    name: "Traditional",
    subcategories: [
      "Kurta",
      "Sherwani",
      "Nehru Jacket",
      "Dhoti",
      "Pajama",
      "Kurta Set",
    ],
  },
  {
    id: "activewear",
    name: "Activewear",
    subcategories: [
      "Gym T-Shirt",
      "Compression Shirt",
      "Training Shorts",
      "Running Shorts",
      "Track Pants",
      "Sports Jacket",
    ],
  },
  {
    id: "footwear",
    name: "Footwear",
    subcategories: [
      "Sneakers",
      "Running Shoes",
      "Trainers",
      "Boots",
      "Chelsea Boots",
      "Loafers",
      "Oxfords",
      "Derbies",
      "Sandals",
      "Slippers",
      "Flip Flops",
    ],
  },
  {
    id: "accessory",
    name: "Accessories",
    subcategories: [
      "Cap",
      "Hat",
      "Belt",
      "Tie",
      "Bow Tie",
      "Scarf",
      "Gloves",
      "Watch",
      "Sunglasses",
      "Wallet",
      "Backpack",
    ],
  },
];

export const WOMEN_CATEGORIES: CategoryDef[] = [
  {
    id: "top",
    name: "Tops",
    subcategories: [
      "T-Shirt",
      "Shirt",
      "Blouse",
      "Tank Top",
      "Crop Top",
      "Camisole",
      "Tunic",
      "Bodysuit",
      "Polo Shirt",
      "Kurti",
      "Peplum Top",
      "Off Shoulder Top",
    ],
  },
  {
    id: "bottom",
    name: "Bottoms",
    subcategories: [
      "Jeans",
      "Trousers",
      "Leggings",
      "Jeggings",
      "Shorts",
      "Skirt",
      "Mini Skirt",
      "Midi Skirt",
      "Maxi Skirt",
      "Palazzo",
      "Culottes",
      "Joggers",
      "Salwar",
    ],
  },
  {
    id: "dress",
    name: "Dresses",
    subcategories: [
      "Mini Dress",
      "Midi Dress",
      "Maxi Dress",
      "Bodycon Dress",
      "Wrap Dress",
      "Shirt Dress",
      "A-Line Dress",
      "Shift Dress",
      "Gown",
      "Slip Dress",
    ],
  },
  {
    id: "jumpsuit",
    name: "Jumpsuits",
    subcategories: ["Jumpsuit", "Romper"],
  },
  {
    id: "outerwear",
    name: "Outerwear",
    subcategories: [
      "Denim Jacket",
      "Leather Jacket",
      "Bomber Jacket",
      "Cardigan",
      "Coat",
      "Trench Coat",
      "Blazer",
      "Shrug",
      "Puffer Jacket",
    ],
  },
  {
    id: "ethnic",
    name: "Ethnic Wear",
    subcategories: [
      "Saree",
      "Lehenga",
      "Kurta",
      "Kurti",
      "Salwar Suit",
      "Dupatta",
      "Blouse",
    ],
  },
  {
    id: "activewear",
    name: "Activewear",
    subcategories: [
      "Sports Bra",
      "Gym Top",
      "Leggings",
      "Running Shorts",
      "Yoga Pants",
      "Jacket",
    ],
  },
  {
    id: "footwear",
    name: "Footwear",
    subcategories: [
      "Sneakers",
      "Flats",
      "Heels",
      "Pumps",
      "Sandals",
      "Boots",
      "Wedges",
      "Loafers",
      "Flip Flops",
    ],
  },
  {
    id: "accessory",
    name: "Accessories",
    subcategories: [
      "Handbag",
      "Tote Bag",
      "Clutch",
      "Belt",
      "Watch",
      "Sunglasses",
      "Scarf",
      "Hat",
      "Jewellery",
    ],
  },
];

// Helper to get combined unique categories & subcategories for Mixed Wardrobe
export function getCategoriesForWardrobeType(type: WardrobeType = "mixed"): CategoryDef[] {
  if (type === "men") return MEN_CATEGORIES;
  if (type === "women") return WOMEN_CATEGORIES;

  // Combine Men & Women categories for Mixed
  const categoryMap = new Map<string, { name: string; subs: Set<string> }>();

  [...MEN_CATEGORIES, ...WOMEN_CATEGORIES].forEach((cat) => {
    if (!categoryMap.has(cat.id)) {
      categoryMap.set(cat.id, { name: cat.name, subs: new Set(cat.subcategories) });
    } else {
      const existing = categoryMap.get(cat.id)!;
      cat.subcategories.forEach((s) => existing.subs.add(s));
    }
  });

  return Array.from(categoryMap.entries()).map(([id, { name, subs }]) => ({
    id,
    name,
    subcategories: Array.from(subs),
  }));
}

export function getSubcategoriesForCategory(
  category: string,
  type: WardrobeType = "mixed",
): string[] {
  const categories = getCategoriesForWardrobeType(type);
  const found = categories.find(
    (c) => c.id.toLowerCase() === category.toLowerCase() || c.name.toLowerCase() === category.toLowerCase(),
  );
  return found ? found.subcategories : [];
}

// Shared Global Option Arrays
export const MATERIALS = [
  "Cotton",
  "Linen",
  "Denim",
  "Polyester",
  "Wool",
  "Silk",
  "Satin",
  "Leather",
  "Faux Leather",
  "Suede",
  "Velvet",
  "Nylon",
  "Rayon",
  "Viscose",
  "Cashmere",
  "Chiffon",
  "Georgette",
  "Lace",
  "Knit",
];

export const PATTERNS = [
  "Solid",
  "Graphic",
  "Printed",
  "Floral",
  "Striped",
  "Checked",
  "Plaid",
  "Polka Dot",
  "Paisley",
  "Animal Print",
  "Abstract",
  "Geometric",
  "Tie Dye",
  "Textured",
];

export const FITS = [
  "Slim",
  "Regular",
  "Relaxed",
  "Loose",
  "Oversized",
  "Tailored",
  "Straight",
  "Bodycon",
];

export const SEASONS = ["Summer", "Winter", "Spring", "Autumn", "All Season"];

export const OCCASIONS = [
  "Casual",
  "Smart Casual",
  "Business Casual",
  "Formal",
  "Party",
  "Wedding",
  "Festive",
  "Office",
  "College",
  "Date Night",
  "Travel",
  "Beach",
  "Gym",
  "Lounge",
  "Home",
];

export const NECKLINES = [
  "Crew Neck",
  "Round Neck",
  "V Neck",
  "U Neck",
  "Square Neck",
  "Boat Neck",
  "Scoop Neck",
  "Sweetheart",
  "High Neck",
  "Mock Neck",
  "Turtleneck",
  "Halter",
  "Off Shoulder",
  "One Shoulder",
  "Collared",
];

export const SLEEVES = [
  "Sleeveless",
  "Cap Sleeve",
  "Short",
  "Half",
  "Three Quarter",
  "Long",
  "Bell Sleeve",
  "Puff Sleeve",
  "Bishop Sleeve",
  "Raglan",
];

export const TOP_LENGTHS = ["Cropped", "Regular", "Longline"];

export const BOTTOM_LENGTHS = ["Short", "Knee Length", "Ankle Length", "Full Length"];

export const DRESS_LENGTHS = [
  "Mini",
  "Above Knee",
  "Knee Length",
  "Midi",
  "Maxi",
  "Floor Length",
];

export const BOTTOM_FITS = [
  "Skinny",
  "Slim",
  "Straight",
  "Wide Leg",
  "Bootcut",
  "Flared",
  "Relaxed",
  "Cargo",
];

export const WAIST_RISES = ["Low Rise", "Mid Rise", "High Rise", "Ultra High Rise"];

export const HEEL_HEIGHTS = ["Flat", "Low", "Mid", "High", "Platform"];

export const WARMTH_LEVELS = ["Light", "Medium", "Heavy"];

export const LAYER_TYPES = ["Base Layer", "Main Piece", "Outer Layer"];

export const TRANSPARENCIES = ["Opaque", "Semi Sheer", "Sheer"];

export const STRETCH_LEVELS = ["No Stretch", "Medium Stretch", "High Stretch"];

export const SIZES_TOPS = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
export const SIZES_BOTTOMS = ["26", "28", "30", "32", "34", "36", "38", "40", "XS", "S", "M", "L", "XL", "XXL"];
export const SIZES_FOOTWEAR = ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"];

export interface ActiveFieldDef {
  key: string;
  label: string;
  options?: string[];
  type?: "select" | "color" | "text" | "tags";
}

/**
 * Returns active attribute fields based on category and subcategory.
 */
export function getActiveFieldsForCategory(category: string, subcategory?: string): ActiveFieldDef[] {
  const cat = category.toLowerCase();
  const sub = (subcategory || "").toLowerCase();

  const isTop = cat === "top" || cat === "tops";
  const isBottom = cat === "bottom" || cat === "bottoms";
  const isDress = cat === "dress" || cat === "dresses" || cat === "jumpsuit" || cat === "jumpsuits";
  const isOuterwear = cat === "outerwear" || cat === "suit" || cat === "suits";
  const isFootwear = cat === "footwear";
  const isEthnic = cat === "ethnic" || cat === "traditional";
  const isAccessory = cat === "accessory" || cat === "accessories";

  const fields: ActiveFieldDef[] = [];

  // Category & Subcategory always present
  fields.push({ key: "category", label: "Category", type: "select" });
  fields.push({ key: "type", label: "Subcategory / Type", type: "select" });

  // Size field
  if (isFootwear) {
    fields.push({ key: "size", label: "Shoe Size", options: SIZES_FOOTWEAR, type: "select" });
  } else if (isBottom) {
    fields.push({ key: "size", label: "Waist Size", options: SIZES_BOTTOMS, type: "select" });
  } else if (!isAccessory) {
    fields.push({ key: "size", label: "Size", options: SIZES_TOPS, type: "select" });
  }

  // Colors
  fields.push({ key: "color", label: "Primary Color", type: "color" });
  fields.push({ key: "secondary_color", label: "Secondary Color", type: "color" });

  // Material
  fields.push({ key: "material", label: "Material", options: MATERIALS, type: "select" });

  // Pattern (not for shoes/accessories)
  if (!isFootwear && !isAccessory) {
    fields.push({ key: "pattern", label: "Pattern", options: PATTERNS, type: "select" });
  }

  // Style / Vibe
  fields.push({ key: "style", label: "Style", options: OCCASIONS, type: "select" });

  // Tops & Outerwear specific
  if (isTop || isOuterwear || isDress || isEthnic) {
    fields.push({ key: "neckline", label: "Neckline", options: NECKLINES, type: "select" });
    fields.push({ key: "sleeve_length", label: "Sleeve Length", options: SLEEVES, type: "select" });
    fields.push({ key: "fit", label: "Fit", options: FITS, type: "select" });
    if (isTop) {
      fields.push({ key: "length", label: "Top Length", options: TOP_LENGTHS, type: "select" });
    }
  }

  // Bottoms specific
  if (isBottom) {
    fields.push({ key: "length", label: "Bottom Length", options: BOTTOM_LENGTHS, type: "select" });
    fields.push({ key: "bottom_fit", label: "Leg Fit", options: BOTTOM_FITS, type: "select" });
    fields.push({ key: "waist_rise", label: "Waist Rise", options: WAIST_RISES, type: "select" });
    fields.push({ key: "fit", label: "Fit", options: FITS, type: "select" });
  }

  // Dresses specific
  if (isDress) {
    fields.push({ key: "dress_length", label: "Dress Length", options: DRESS_LENGTHS, type: "select" });
    fields.push({ key: "transparency", label: "Transparency", options: TRANSPARENCIES, type: "select" });
  }

  // Footwear specific (Heel Height for heels/wedges)
  if (isFootwear && (sub.includes("heel") || sub.includes("wedge") || sub.includes("pump"))) {
    fields.push({ key: "heel_height", label: "Heel Height", options: HEEL_HEIGHTS, type: "select" });
  }

  // Outerwear layering & warmth
  if (isOuterwear || isTop) {
    fields.push({ key: "warmth", label: "Warmth", options: WARMTH_LEVELS, type: "select" });
    fields.push({ key: "layer_type", label: "Layer Type", options: LAYER_TYPES, type: "select" });
  }

  // General text inputs
  fields.push({ key: "brand", label: "Brand", type: "text" });
  fields.push({ key: "description", label: "Description", type: "text" });

  return fields;
}
