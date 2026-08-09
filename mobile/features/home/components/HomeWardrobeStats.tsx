import { Platform, StyleSheet, Text, View } from "react-native";
import { spacing, typography } from "@/theme";
import { homeTokens, neumorphicStyles } from "../theme/homeTokens";
import type { HomeWardrobeStatsProps } from "../types";

export function HomeWardrobeStats({
  totalItems,
  categoryCount,
  savedOutfitsCount,
}: HomeWardrobeStatsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Wardrobe Insights</Text>
      <View style={styles.statsGrid}>
        {/* Stat Tile 1: Total Items */}
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>

        {/* Stat Tile 2: Categories */}
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{categoryCount}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>

        {/* Stat Tile 3: Saved Outfits */}
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{savedOutfitsCount}</Text>
          <Text style={styles.statLabel}>Saved Looks</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 20,
    fontWeight: "700",
    color: homeTokens.textPrimary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    ...neumorphicStyles.subtle,
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 26,
    fontWeight: "700",
    color: homeTokens.textPrimary,
    textAlign: "center",
  },
  statLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: homeTokens.textSecondary,
    textAlign: "center",
    marginTop: spacing.xxs,
  },
});
