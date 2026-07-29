/**
 * Wardrobe feature — shared type helpers and constants.
 * These values match the backend's attribute keys exactly.
 */

export interface WardrobeCategory {
  /** API filter key (empty string = all) */
  key: string;
  label: string;
  icon: string;
}

export const WARDROBE_CATEGORIES: WardrobeCategory[] = [
  { key: "", label: "All", icon: "👔" },
  { key: "top", label: "Tops", icon: "👕" },
  { key: "bottom", label: "Bottoms", icon: "👖" },
  { key: "outerwear", label: "Outerwear", icon: "🧥" },
  { key: "footwear", label: "Shoes", icon: "👟" },
  { key: "accessory", label: "Accessories", icon: "👜" },
  { key: "dress", label: "Dresses", icon: "👗" },
  { key: "other", label: "Others", icon: "🗂️" },
];

/** Fields the user can edit on a clothing item */
export interface EditableField {
  key: string;
  label: string;
  multiline?: boolean;
}

export const EDITABLE_FIELDS: EditableField[] = [
  { key: "category", label: "Category" },
  { key: "type", label: "Type" },
  { key: "color", label: "Color" },
  { key: "pattern", label: "Pattern" },
  { key: "material", label: "Material" },
  { key: "style", label: "Style" },
  { key: "neckline", label: "Neckline" },
  { key: "sleeve_length", label: "Sleeve Length" },
  { key: "fit", label: "Fit" },
  { key: "length", label: "Length" },
  { key: "closure", label: "Closure" },
  { key: "brand", label: "Brand" },
  { key: "description", label: "Description", multiline: true },
];

/**
 * Extracts a readable string from an attribute value.
 * Handles both AttributeConfidence ({ value, confidence }) and plain strings.
 */
export function getAttrValue(attr: unknown): string {
  if (attr == null) return "";
  if (typeof attr === "string") return attr;
  if (typeof attr === "object" && "value" in (attr as object)) {
    return String((attr as { value: unknown }).value ?? "");
  }
  return "";
}

/**
 * Extracts a display label from item attributes.
 * Returns e.g. "navy blue t-shirt".
 */
export function getClothingLabel(attrs: Record<string, unknown>): string {
  const color = getAttrValue(attrs.color);
  const type = getAttrValue(attrs.type) || "item";
  return [color, type].filter(Boolean).join(" ");
}

/**
 * Returns the best available image URL for a wardrobe item.
 */
export function getItemImageUrl(item: {
  thumbnail_url?: string | null;
  segmented_image_url: string;
  original_image_url: string;
}): string {
  return item.thumbnail_url || item.segmented_image_url || item.original_image_url;
}
