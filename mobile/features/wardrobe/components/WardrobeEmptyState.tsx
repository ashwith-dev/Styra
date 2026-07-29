import { StyleSheet, View } from "react-native";
import { EmptyState } from "@/components/ui";
import { spacing } from "@/theme";

interface WardrobeEmptyStateProps {
  isFiltered: boolean;
  onClearFilters: () => void;
  onAddItem: () => void;
}

/**
 * Two-state empty view for the wardrobe:
 *   1. Filtered empty — no items match the current search/category.
 *   2. Truly empty    — the wardrobe has no items at all.
 */
export function WardrobeEmptyState({
  isFiltered,
  onClearFilters,
  onAddItem,
}: WardrobeEmptyStateProps) {
  if (isFiltered) {
    return (
      <View style={styles.wrapper}>
        <EmptyState
          icon="🔍"
          title="No matching items"
          description="Try a different search term or category filter."
          actionLabel="Clear Filters"
          onAction={onClearFilters}
          testID="wardrobe-empty-filtered"
        />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <EmptyState
        icon="👗"
        title="Your wardrobe is empty"
        description="Add your first clothing item to start building your AI wardrobe."
        actionLabel="Add First Item"
        onAction={onAddItem}
        testID="wardrobe-empty"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
});
