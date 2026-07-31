import { MAIN_COLOR_OPTIONS, PREDEFINED_SHADES_CATEGORIES } from "@/features/onboarding/config";

// Cache map for color lookup (Name / ID -> Hex)
const COLOR_MAP: Record<string, string> = {};

// Populate map from MAIN_COLOR_OPTIONS
MAIN_COLOR_OPTIONS.forEach((item) => {
  COLOR_MAP[item.id.toLowerCase()] = item.hex;
  COLOR_MAP[item.name.toLowerCase()] = item.hex;
});

// Populate map from PREDEFINED_SHADES_CATEGORIES
PREDEFINED_SHADES_CATEGORIES.forEach((cat) => {
  cat.shades.forEach((shade) => {
    COLOR_MAP[shade.id.toLowerCase()] = shade.hex;
    COLOR_MAP[shade.name.toLowerCase()] = shade.hex;
  });
});

/**
 * Resolves any color input (Hex code, color name, or color ID) to a valid hex string.
 */
export function resolveColorHex(input: string): string {
  if (!input) return "#808080";
  const trimmed = input.trim();
  if (trimmed.startsWith("#")) {
    return trimmed;
  }
  const key = trimmed.toLowerCase();
  if (COLOR_MAP[key]) {
    return COLOR_MAP[key];
  }
  // Try replacing spaces with underscores or vice versa
  const keyUnderscore = key.replace(/\s+/g, "_");
  if (COLOR_MAP[keyUnderscore]) {
    return COLOR_MAP[keyUnderscore];
  }
  const keySpace = key.replace(/_/g, " ");
  if (COLOR_MAP[keySpace]) {
    return COLOR_MAP[keySpace];
  }
  // Fallback to default neutral hex if not found
  return "#808080";
}

// Label dictionaries for Title Case formatting
const STYLE_LABEL_MAP: Record<string, string> = {
  minimal: "Minimal",
  smart_casual: "Smart Casual",
  classic: "Classic",
  streetwear: "Streetwear",
  formal: "Formal",
  bohemian: "Bohemian",
  elegant: "Elegant",
  sporty: "Sporty",
  everyday: "Everyday",
};

const FIT_LABEL_MAP: Record<string, string> = {
  slim: "Slim",
  regular: "Regular",
  relaxed: "Relaxed",
  oversized: "Oversized",
};

const LIFESTYLE_LABEL_MAP: Record<string, string> = {
  college: "College / University",
  office: "Office / Professional",
  home: "Mostly Home",
  creative: "Creative / Casual",
  travel: "Travel Often",
  active: "Active Lifestyle",
  other: "Other",
  casual: "Casual",
};

/**
 * Formats preference keys/ids into human-readable Title Case strings.
 */
export function formatPreferenceLabel(
  input: string,
  category?: "style" | "fit" | "lifestyle",
): string {
  if (!input) return "Not Selected";
  const key = input.trim().toLowerCase();

  if (category === "style" && STYLE_LABEL_MAP[key]) {
    return STYLE_LABEL_MAP[key];
  }
  if (category === "fit" && FIT_LABEL_MAP[key]) {
    return FIT_LABEL_MAP[key];
  }
  if (category === "lifestyle" && LIFESTYLE_LABEL_MAP[key]) {
    return LIFESTYLE_LABEL_MAP[key];
  }

  // Fallback map check across all
  if (STYLE_LABEL_MAP[key]) return STYLE_LABEL_MAP[key];
  if (FIT_LABEL_MAP[key]) return FIT_LABEL_MAP[key];
  if (LIFESTYLE_LABEL_MAP[key]) return LIFESTYLE_LABEL_MAP[key];

  // Generic fallback: replace underscores with spaces and capitalize words
  return input
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
