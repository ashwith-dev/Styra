import { StyleSheet, View } from "react-native";
import { LoadingSkeletonCard } from "@/components/ui";
import { spacing } from "@/theme";

const SKELETON_COUNT = 6;

/**
 * 2-column grid of skeleton cards shown during the initial wardrobe load.
 * Matches the layout of ClothingGrid so there is no visual jump on load.
 */
export function WardrobeLoadingSkeleton() {
  const pairs = Array.from({ length: Math.ceil(SKELETON_COUNT / 2) });

  return (
    <View
      style={styles.container}
      accessibilityLabel="Loading wardrobe"
      accessibilityRole="progressbar"
    >
      {pairs.map((_, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          <View style={styles.cell}>
            <LoadingSkeletonCard />
          </View>
          <View style={styles.cell}>
            <LoadingSkeletonCard />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cell: {
    flex: 1,
  },
});
