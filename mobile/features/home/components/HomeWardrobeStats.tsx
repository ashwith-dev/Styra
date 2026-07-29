import { StyleSheet, Text, View } from "react-native";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { colors, spacing, typography } from "@/theme";
import type { HomeWardrobeStatsProps } from "../types";

export function HomeWardrobeStats({
  totalItems,
  categoryCount,
  topCategory,
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
          <View style={styles.topCatHeader}>
            <Text style={styles.statLabel}>Top Category</Text>
            {topCategory && (
              <Badge label="ACTIVE" variant="default" size="sm" />
            )}
          </View>
          <Text style={styles.topCatValue} numberOfLines={1}>
            {topCategory ? topCategory.toUpperCase() : "—"}
          </Text>
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
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
  },
  statNumber: {
    ...typography.h1,
    color: colors.textPrimary,
    fontSize: 24,
  },
  statLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  topCatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xxs,
  },
  topCatValue: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
    fontSize: 13,
  },
});
