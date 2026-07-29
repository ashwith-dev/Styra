import type { ClothingItemBrief } from "@/lib/types";

export interface WardrobeRequirementConfig {
  requiredTops: number;
  requiredBottoms: number;
}

export const DEFAULT_WARDROBE_REQUIREMENTS: WardrobeRequirementConfig = {
  requiredTops: 2,
  requiredBottoms: 2,
};

export interface WardrobeValidationResult {
  isUnlocked: boolean;
  topsCount: number;
  bottomsCount: number;
  requiredTops: number;
  requiredBottoms: number;
  topsProgress: number; // 0..1
  bottomsProgress: number; // 0..1
}

const TOP_CATEGORIES = new Set([
  "top",
  "tops",
  "t-shirt",
  "t-shirts",
  "tshirt",
  "tshirts",
  "shirt",
  "shirts",
  "hoodie",
  "hoodies",
  "sweater",
  "sweaters",
  "jacket",
  "jackets",
  "blazer",
  "blazers",
  "coat",
  "coats",
  "outerwear",
  "upper",
]);

const BOTTOM_CATEGORIES = new Set([
  "bottom",
  "bottoms",
  "pants",
  "trousers",
  "jeans",
  "shorts",
  "skirt",
  "skirts",
  "lower",
]);

/**
 * Validates whether the user's wardrobe meets minimum requirements to unlock AI outfit generation.
 * Requirements: At least 2 Top Wear items and at least 2 Bottom Wear items.
 */
export function validateMinimumWardrobe(
  items: ClothingItemBrief[],
  config: WardrobeRequirementConfig = DEFAULT_WARDROBE_REQUIREMENTS,
): WardrobeValidationResult {
  let topsCount = 0;
  let bottomsCount = 0;

  for (const item of items) {
    const catAttr = (item.attributes as Record<string, unknown>)?.category;
    let catVal = "";
    if (typeof catAttr === "object" && catAttr !== null && "value" in catAttr) {
      catVal = String((catAttr as { value: unknown }).value).toLowerCase().trim();
    } else if (typeof catAttr === "string") {
      catVal = catAttr.toLowerCase().trim();
    }

    const typeAttr = (item.attributes as Record<string, unknown>)?.type;
    let typeVal = "";
    if (typeof typeAttr === "object" && typeAttr !== null && "value" in typeAttr) {
      typeVal = String((typeAttr as { value: unknown }).value).toLowerCase().trim();
    } else if (typeof typeAttr === "string") {
      typeVal = typeAttr.toLowerCase().trim();
    }

    const combined = `${catVal} ${typeVal}`;

    if (
      TOP_CATEGORIES.has(catVal) ||
      Array.from(TOP_CATEGORIES).some((t) => combined.includes(t))
    ) {
      topsCount++;
    } else if (
      BOTTOM_CATEGORIES.has(catVal) ||
      Array.from(BOTTOM_CATEGORIES).some((b) => combined.includes(b))
    ) {
      bottomsCount++;
    } else {
      // Default heuristic: items default to tops if unspecified
      topsCount++;
    }
  }

  const isUnlocked =
    topsCount >= config.requiredTops && bottomsCount >= config.requiredBottoms;

  return {
    isUnlocked,
    topsCount,
    bottomsCount,
    requiredTops: config.requiredTops,
    requiredBottoms: config.requiredBottoms,
    topsProgress: Math.min(1, topsCount / config.requiredTops),
    bottomsProgress: Math.min(1, bottomsCount / config.requiredBottoms),
  };
}
