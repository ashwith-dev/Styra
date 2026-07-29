import { memo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Chip } from "@/components/ui";
import { spacing } from "@/theme";

/**
 * Category keys match the backend's `category.value` attribute exactly.
 * Keeping this colocated here avoids an unnecessary cross-feature import.
 */
const CATEGORIES = [
  { key: "", label: "All" },
  { key: "top", label: "Tops" },
  { key: "bottom", label: "Bottoms" },
  { key: "outerwear", label: "Outerwear" },
  { key: "footwear", label: "Shoes" },
  { key: "accessory", label: "Accessories" },
  { key: "dress", label: "Dresses" },
  { key: "other", label: "Others" },
] as const;

interface CategoryFilterProps {
  selected: string;
  onSelect: (key: string) => void;
  testID?: string;
}

/**
 * Horizontally scrolling category filter strip.
 * Composes the existing Chip UI component — no standalone chip implementation.
 */
export const CategoryFilter = memo(function CategoryFilter({
  selected,
  onSelect,
  testID,
}: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      testID={testID}
      accessibilityRole="tablist"
    >
      {CATEGORIES.map((cat) => (
        <Chip
          key={cat.key}
          label={cat.label}
          selected={cat.key === selected}
          onPress={() => onSelect(cat.key)}
          testID={`category-${cat.key || "all"}`}
        />
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
});
