import type {
  ColorOption,
  ColorShadeCategory,
  FitOption,
  LifestyleOption,
  StyleOption,
} from "./types/onboarding";

export const TOTAL_ONBOARDING_STEPS = 7;

export const LIFESTYLE_OPTIONS: LifestyleOption[] = [
  {
    id: "college",
    title: "College / University",
    subtitle: "Academic & Social Environments",
    iconName: "school-outline",
  },
  {
    id: "office",
    title: "Office / Professional",
    subtitle: "Corporate & Business Settings",
    iconName: "briefcase-outline",
  },
  {
    id: "home",
    title: "Mostly Home",
    subtitle: "Remote Work & Domestic Life",
    iconName: "home-outline",
  },
  {
    id: "creative",
    title: "Creative / Casual",
    subtitle: "Studio Space & Relaxed Vibes",
    iconName: "color-palette-outline",
  },
  {
    id: "travel",
    title: "Travel Often",
    subtitle: "Global Transit & Exploration",
    iconName: "airplane-outline",
  },
  {
    id: "active",
    title: "Active Lifestyle",
    subtitle: "Athletic Pursuits & Outdoor Living",
    iconName: "fitness-outline",
  },
  {
    id: "other",
    title: "Other",
    subtitle: "A unique mix of experiences",
    iconName: "ellipsis-horizontal-outline",
  },
];

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: "minimal",
    title: "Minimal",
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "smart_casual",
    title: "Smart Casual",
    imageUrl:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "classic",
    title: "Classic",
    imageUrl:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "streetwear",
    title: "Streetwear",
    imageUrl:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "elegant",
    title: "Elegant",
    imageUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "formal",
    title: "Formal",
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sporty",
    title: "Sporty",
    imageUrl:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "everyday",
    title: "Everyday",
    imageUrl:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
  },
];

export const MAIN_COLOR_OPTIONS: ColorOption[] = [
  { id: "white", name: "White", hex: "#FFFFFF", borderColor: "#E0DDD5" },
  { id: "black", name: "Black", hex: "#1A1A1A" },
  { id: "grey", name: "Grey", hex: "#808080" },
  { id: "red", name: "Red", hex: "#E53935" },
  { id: "orange", name: "Orange", hex: "#FB8C00" },
  { id: "yellow", name: "Yellow", hex: "#FDD835" },
  { id: "green", name: "Green", hex: "#4CAF50" },
  { id: "blue", name: "Blue", hex: "#1E88E5" },
  { id: "purple", name: "Purple", hex: "#8E24AA" },
  { id: "pink", name: "Pink", hex: "#E91E63" },
  { id: "brown", name: "Brown", hex: "#6D4C41" },
];

export const PREDEFINED_SHADES_CATEGORIES: ColorShadeCategory[] = [
  {
    category: "Whites, Creams & Off-Whites",
    shades: [
      { id: "pure_white", name: "Pure White", hex: "#FFFFFF", borderColor: "#E0DDD5" },
      { id: "crisp_white", name: "Crisp White", hex: "#F8F9FA", borderColor: "#E0DDD5" },
      { id: "off_white", name: "Off-White", hex: "#FAF9F6", borderColor: "#E0DDD5" },
      { id: "ivory", name: "Ivory", hex: "#FFFFF0", borderColor: "#E0DDD5" },
      { id: "cream", name: "Cream", hex: "#FFFDD0", borderColor: "#E0DDD5" },
      { id: "ecru", name: "Ecru", hex: "#C2B280" },
      { id: "bone", name: "Bone", hex: "#E3DAC9", borderColor: "#E0DDD5" },
    ],
  },
  {
    category: "Blacks & Grays",
    shades: [
      { id: "jet_black", name: "Jet Black", hex: "#0A0A0A" },
      { id: "washed_black", name: "Washed Black", hex: "#2B2B2B" },
      { id: "charcoal_gray", name: "Charcoal Gray", hex: "#36454F" },
      { id: "dark_slate_gray", name: "Dark Slate Gray", hex: "#2F4F4F" },
      { id: "graphite", name: "Graphite", hex: "#383838" },
      { id: "heather_gray", name: "Heather Gray", hex: "#9AA0A6" },
      { id: "mid_gray", name: "Mid-Gray", hex: "#808080" },
      { id: "light_gray", name: "Light Gray", hex: "#D3D3D3" },
      { id: "cement_gray", name: "Cement Gray", hex: "#8D8B88" },
      { id: "dove_gray", name: "Dove Gray", hex: "#6D6C6A" },
    ],
  },
  {
    category: "Blues & Denims",
    shades: [
      { id: "midnight_navy", name: "Midnight Navy", hex: "#101820" },
      { id: "classic_navy", name: "Classic Navy", hex: "#000080" },
      { id: "deep_indigo", name: "Deep Indigo", hex: "#1A237E" },
      { id: "raw_denim_blue", name: "Raw Denim Blue", hex: "#1565C0" },
      { id: "washed_denim", name: "Washed Denim", hex: "#5C6BC0" },
      { id: "steel_blue", name: "Steel Blue", hex: "#4682B4" },
      { id: "royal_blue", name: "Royal Blue", hex: "#4169E1" },
      { id: "sky_blue", name: "Sky Blue", hex: "#87CEEB" },
      { id: "baby_blue", name: "Baby Blue", hex: "#89CFF0" },
      { id: "powder_blue", name: "Powder Blue", hex: "#B0E0E6" },
    ],
  },
  {
    category: "Browns, Beiges & Earth Neutrals",
    shades: [
      { id: "classic_khaki", name: "Classic Khaki", hex: "#C3B091" },
      { id: "dark_khaki", name: "Dark Khaki", hex: "#9E8B6B" },
      { id: "classic_beige", name: "Classic Beige", hex: "#F5F5DC", borderColor: "#E0DDD5" },
      { id: "sand", name: "Sand", hex: "#C2B280" },
      { id: "camel", name: "Camel", hex: "#C19A6B" },
      { id: "tan", name: "Tan", hex: "#D2B48C" },
      { id: "taupe", name: "Taupe", hex: "#483C32" },
      { id: "mocha", name: "Mocha", hex: "#967969" },
      { id: "dark_chocolate_brown", name: "Dark Chocolate Brown", hex: "#3D2314" },
      { id: "chestnut_brown", name: "Chestnut Brown", hex: "#954535" },
      { id: "warm_nude", name: "Warm Nude", hex: "#E3BC9A" },
      { id: "oatmeal", name: "Oatmeal", hex: "#E3D9C6" },
    ],
  },
  {
    category: "Greens & Olives",
    shades: [
      { id: "olive_green", name: "Olive Green", hex: "#556B2F" },
      { id: "dark_army_green", name: "Dark Army Green", hex: "#4B5320" },
      { id: "sage_green", name: "Sage Green", hex: "#9DC183" },
      { id: "forest_green", name: "Forest Green", hex: "#228B22" },
      { id: "emerald_green", name: "Emerald Green", hex: "#50C878" },
      { id: "hunter_green", name: "Hunter Green", hex: "#355E3B" },
      { id: "moss_green", name: "Moss Green", hex: "#8A9A5B" },
      { id: "pine_green", name: "Pine Green", hex: "#01796F" },
      { id: "mint_green", name: "Mint Green", hex: "#98FF98" },
      { id: "seafoam_green", name: "Seafoam Green", hex: "#9FE2BF" },
    ],
  },
  {
    category: "Reds, Pinks & Wine Tones",
    shades: [
      { id: "burgundy", name: "Burgundy", hex: "#800020" },
      { id: "wine_red", name: "Wine Red", hex: "#722F37" },
      { id: "maroon", name: "Maroon", hex: "#800000" },
      { id: "rust_red", name: "Rust Red", hex: "#B7410E" },
      { id: "crimson", name: "Crimson", hex: "#DC143C" },
      { id: "classic_red", name: "Classic Red", hex: "#E53935" },
      { id: "dusty_pink", name: "Dusty Pink", hex: "#DCAE96" },
      { id: "blush_pink", name: "Blush Pink", hex: "#DE5D83" },
      { id: "rose_pink", name: "Rose Pink", hex: "#FF007F" },
      { id: "coral", name: "Coral", hex: "#FF7F50" },
    ],
  },
  {
    category: "Earthy Oranges & Warm Yellows",
    shades: [
      { id: "terracotta", name: "Terracotta", hex: "#E2725B" },
      { id: "burnt_orange", name: "Burnt Orange", hex: "#CC5500" },
      { id: "mustard_yellow", name: "Mustard Yellow", hex: "#FFDB58" },
      { id: "ochre", name: "Ochre", hex: "#CC7722" },
      { id: "amber", name: "Amber", hex: "#FFBF00" },
      { id: "pastel_butter_yellow", name: "Pastel Butter Yellow", hex: "#FFFDD0", borderColor: "#E0DDD5" },
    ],
  },
  {
    category: "Purples & Muted Violets",
    shades: [
      { id: "deep_plum", name: "Deep Plum", hex: "#4A0E4E" },
      { id: "eggplant", name: "Eggplant", hex: "#311432" },
      { id: "mauve", name: "Mauve", hex: "#E0B0FF" },
      { id: "lavender", name: "Lavender", hex: "#E6E6FA" },
      { id: "lilac", name: "Lilac", hex: "#C8A2C8" },
    ],
  },
];

export const FIT_OPTIONS: FitOption[] = [
  {
    id: "slim",
    title: "Slim",
    description: "Tailored close to the body for a refined, modern look.",
    imageUrl:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "regular",
    title: "Regular",
    description: "A balanced fit with comfortable room throughout.",
    imageUrl:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "oversized",
    title: "Oversized",
    description: "Generous silhouette with an effortless, casual drape.",
    imageUrl:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
  },
];

export const STEP1_IMAGES = {
  coat: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80",
  bag: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
  closet: "https://images.unsplash.com/photo-1558882224-dda166733046?auto=format&fit=crop&w=800&q=80",
};

export const STEP2_QUOTE_IMAGE =
  "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80";

export const STEP4_FABRIC_IMAGE =
  "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80";

export const STEP6_NOTIF_IMAGE =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80";

export const STEP7_READY_IMAGE =
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80";
