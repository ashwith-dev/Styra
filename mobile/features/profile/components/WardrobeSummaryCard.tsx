import { Platform, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, spacing, typography } from "@/theme";

interface WardrobeSummaryCardProps {
  stats: {
    totalItems: number;
    savedLooksCount: number;
    categoryCount: number;
    outfitsCreatedCount: number;
  };
}

export function WardrobeSummaryCard({ stats }: WardrobeSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionHeaderLabel}>WARDROBE SUMMARY</Text>

      <View style={styles.grid}>
        {/* Row 1 */}
        <View style={styles.gridRow}>
          <View style={styles.statCell}>
            <Text style={styles.statNumber}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statNumber}>{stats.savedLooksCount}</Text>
            <Text style={styles.statLabel}>Saved Looks</Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.gridRow}>
          <View style={styles.statCell}>
            <Text style={styles.statNumber}>{stats.categoryCount}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statNumber}>{stats.outfitsCreatedCount}</Text>
            <Text style={styles.statLabel}>Outfits Created</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F7F5F0",
    borderRadius: 26,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
  sectionHeaderLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: spacing.lg,
  },
  grid: {
    gap: spacing.lg,
  },
  gridRow: {
    flexDirection: "row",
    gap: spacing.xl,
  },
  statCell: {
    flex: 1,
  },
  statNumber: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.body,
    fontSize: 14,
    color: "#7F7C76",
  },
});
