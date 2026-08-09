import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface MinItemsRequirementsCardProps {
  topsCount?: number;
  requiredTops?: number;
  bottomsCount?: number;
  requiredBottoms?: number;
  footwearCount?: number;
  requiredFootwear?: number;
  onAddClothing: () => void;
}

/**
 * Card displayed on Home Screen for new users showing the exact
 * minimum item counts needed for AI Outfit Generation stacked as full-width rows:
 * 1. Tops: 2 items minimum
 * 2. Bottoms: 2 items minimum
 * 3. Footwear: 1 item minimum
 */
export function MinItemsRequirementsCard({
  topsCount = 0,
  requiredTops = 2,
  bottomsCount = 0,
  requiredBottoms = 2,
  footwearCount = 0,
  requiredFootwear = 1,
  onAddClothing,
}: MinItemsRequirementsCardProps) {
  const totalAdded = topsCount + bottomsCount + footwearCount;
  const totalRequired = requiredTops + requiredBottoms + requiredFootwear;
  const isComplete =
    topsCount >= requiredTops &&
    bottomsCount >= requiredBottoms &&
    footwearCount >= requiredFootwear;

  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.sparkleBox}>
            <Ionicons name="sparkles" size={15} color={colors.textPrimary} />
          </View>
          <Text style={styles.headerLabel}>OUTFIT GENERATOR REQUIREMENTS</Text>
        </View>

        <View style={[styles.statusBadge, isComplete && styles.statusBadgeComplete]}>
          <Text style={[styles.statusText, isComplete && styles.statusTextComplete]}>
            {isComplete ? "UNLOCKED" : `${totalAdded}/${totalRequired} ITEMS`}
          </Text>
        </View>
      </View>

      {/* Main Title & Subtitle */}
      <Text style={styles.title}>Minimum Items Required</Text>
      <Text style={styles.subtitle}>
        Add these essential pieces to your digital closet to enable AI outfit generation and daily styling.
      </Text>

      {/* Requirement List (3 Rows) */}
      <View style={styles.rowsContainer}>
        {/* Row 1: Tops */}
        <View
          style={[
            styles.reqRow,
            topsCount >= requiredTops && styles.reqRowComplete,
          ]}
        >
          <View style={styles.rowLeft}>
            <View
              style={[
                styles.iconBox,
                topsCount >= requiredTops && styles.iconBoxComplete,
              ]}
            >
              <Ionicons
                name={topsCount >= requiredTops ? "checkmark-circle" : "shirt-outline"}
                size={20}
                color={topsCount >= requiredTops ? colors.success : colors.textPrimary}
              />
            </View>

            <View style={styles.textGroup}>
              <Text style={styles.categoryName}>Tops</Text>
              <Text style={styles.categorySub}>Minimum requirement: {requiredTops} items</Text>
            </View>
          </View>

          <View style={[styles.countBadge, topsCount >= requiredTops && styles.countBadgeComplete]}>
            <Text style={[styles.countBadgeText, topsCount >= requiredTops && styles.countBadgeTextComplete]}>
              {topsCount} / {requiredTops}
            </Text>
          </View>
        </View>

        {/* Row 2: Bottoms */}
        <View
          style={[
            styles.reqRow,
            bottomsCount >= requiredBottoms && styles.reqRowComplete,
          ]}
        >
          <View style={styles.rowLeft}>
            <View
              style={[
                styles.iconBox,
                bottomsCount >= requiredBottoms && styles.iconBoxComplete,
              ]}
            >
              <Ionicons
                name={bottomsCount >= requiredBottoms ? "checkmark-circle" : "layers-outline"}
                size={20}
                color={bottomsCount >= requiredBottoms ? colors.success : colors.textPrimary}
              />
            </View>

            <View style={styles.textGroup}>
              <Text style={styles.categoryName}>Bottoms</Text>
              <Text style={styles.categorySub}>Minimum requirement: {requiredBottoms} items</Text>
            </View>
          </View>

          <View style={[styles.countBadge, bottomsCount >= requiredBottoms && styles.countBadgeComplete]}>
            <Text style={[styles.countBadgeText, bottomsCount >= requiredBottoms && styles.countBadgeTextComplete]}>
              {bottomsCount} / {requiredBottoms}
            </Text>
          </View>
        </View>

        {/* Row 3: Footwear */}
        <View
          style={[
            styles.reqRow,
            footwearCount >= requiredFootwear && styles.reqRowComplete,
          ]}
        >
          <View style={styles.rowLeft}>
            <View
              style={[
                styles.iconBox,
                footwearCount >= requiredFootwear && styles.iconBoxComplete,
              ]}
            >
              <Ionicons
                name={footwearCount >= requiredFootwear ? "checkmark-circle" : "footsteps-outline"}
                size={20}
                color={footwearCount >= requiredFootwear ? colors.success : colors.textPrimary}
              />
            </View>

            <View style={styles.textGroup}>
              <Text style={styles.categoryName}>Footwear</Text>
              <Text style={styles.categorySub}>Minimum requirement: {requiredFootwear} item</Text>
            </View>
          </View>

          <View style={[styles.countBadge, footwearCount >= requiredFootwear && styles.countBadgeComplete]}>
            <Text style={[styles.countBadgeText, footwearCount >= requiredFootwear && styles.countBadgeTextComplete]}>
              {footwearCount} / {requiredFootwear}
            </Text>
          </View>
        </View>
      </View>

      {/* Add Items CTA Button */}
      <TouchableOpacity
        onPress={onAddClothing}
        style={styles.ctaButton}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="Add Clothing Items"
      >
        <Ionicons name="add" size={18} color={colors.surface} />
        <Text style={styles.ctaButtonText}>
          {totalAdded === 0 ? "Upload Items Now" : "Add Remaining Items"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FAF8F5",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  sparkleBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  headerLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#7F7C76",
  },
  statusBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statusBadgeComplete: {
    backgroundColor: "rgba(63, 125, 88, 0.12)",
    borderColor: "rgba(63, 125, 88, 0.3)",
  },
  statusText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.textPrimary,
  },
  statusTextComplete: {
    color: colors.success,
  },
  title: {
    fontFamily: "serif",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    fontSize: 13,
    color: "#666666",
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  rowsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAF8F5",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  reqRowComplete: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(63, 125, 88, 0.3)",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  iconBoxComplete: {
    backgroundColor: "rgba(63, 125, 88, 0.08)",
    borderColor: "rgba(63, 125, 88, 0.2)",
  },
  textGroup: {
    justifyContent: "center",
  },
  categoryName: {
    fontFamily: "serif",
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  categorySub: {
    ...typography.caption,
    fontSize: 12,
    color: "#7F7C76",
  },
  countBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  countBadgeComplete: {
    backgroundColor: "rgba(63, 125, 88, 0.15)",
    borderColor: "rgba(63, 125, 88, 0.3)",
  },
  countBadgeText: {
    fontFamily: "serif",
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  countBadgeTextComplete: {
    color: colors.success,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.textPrimary,
    height: 52,
    borderRadius: radius.full,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface,
  },
});
