import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { colors, spacing, typography } from "@/theme";

interface ProfileStatsRowProps {
  stats: {
    totalItems: number;
    categoryCount: number;
    savedLooksCount: number;
  };
}

export function ProfileStatsRow({ stats }: ProfileStatsRowProps) {
  return (
    <View style={styles.container}>
      <Card variant="flat" padding="md" style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.totalItems}</Text>
        <Text style={styles.statLabel}>Items</Text>
      </Card>

      <Card variant="flat" padding="md" style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.categoryCount}</Text>
        <Text style={styles.statLabel}>Categories</Text>
      </Card>

      <Card variant="flat" padding="md" style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.savedLooksCount}</Text>
        <Text style={styles.statLabel}>Saved Looks</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  statNumber: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
});
