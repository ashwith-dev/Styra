// ── Shared wardrobe components ──
export { CategoryFilter } from "@/components/wardrobe/CategoryFilter";
export { ClothingCard } from "@/components/wardrobe/ClothingCard";

// ── Feature-specific components ──
export { ClothingGrid } from "./components/ClothingGrid";
export { WardrobeHeader } from "./components/WardrobeHeader";
export { WardrobeEmptyState } from "./components/WardrobeEmptyState";
export { WardrobeLoadingSkeleton } from "./components/WardrobeLoadingSkeleton";
export { AddItemFAB } from "./components/AddItemFAB";
export { WardrobeScreenHeader } from "./components/WardrobeScreenHeader";
export { EmptyWardrobeView } from "./components/EmptyWardrobeView";
export { PopulatedWardrobeView } from "./components/PopulatedWardrobeView";
export { CategoryItemsSheet } from "./components/CategoryItemsSheet";

// ── Hooks ──
export { useItemDetail } from "./hooks/useItemDetail";
export type { DetailScreenState } from "./hooks/useItemDetail";

// ── Types & helpers ──
export {
  WARDROBE_CATEGORIES,
  EDITABLE_FIELDS,
  getAttrValue,
  getClothingLabel,
  getItemImageUrl,
} from "./types/wardrobe";
export type { WardrobeCategory, EditableField } from "./types/wardrobe";
