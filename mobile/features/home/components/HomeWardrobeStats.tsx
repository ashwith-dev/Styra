import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { colors, spacing, typography } from "@/theme";
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
        <Card variant="flat" padding="md" style={styles.statCard}>
          <Text style={styles.statNumber}>{totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </Card>

        <Card variant="flat" padding="md" style={styles.statCard}>
          <Text style={styles.statNumber}>{categoryCount}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </Card>

        <Card variant="flat" padding="md" style={styles.statCard}>
          <Text style={styles.statNumber}>{savedOutfitsCount}</Text>
          <Text style={styles.statLabel}>Saved Outfits</Text>
        </Card>
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
    fontFamily: "serif",
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FAF8F5",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  statNumber: {
    fontFamily: "serif",
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
  },
  statLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#7F7C76",
    textAlign: "center",
    marginTop: spacing.xxs,
  },
});
