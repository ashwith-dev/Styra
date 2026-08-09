import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
import { homeTokens, neumorphicStyles } from "../theme/homeTokens";

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
 * Card displayed on Home Screen for new users showing minimum requirement items
 * as neumorphic rows emerging from the warm ivory surface.
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
            <Ionicons name="sparkles" size={14} color={homeTokens.textPrimary} />
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

      {/* Requirement List (3 Neumorphic Rows) */}
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
                size={18}
                color={topsCount >= requiredTops ? colors.success : homeTokens.textPrimary}
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
                size={18}
                color={bottomsCount >= requiredBottoms ? colors.success : homeTokens.textPrimary}
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
                size={18}
                color={footwearCount >= requiredFootwear ? colors.success : homeTokens.textPrimary}
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
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.ctaButtonText}>
          {totalAdded === 0 ? "Upload Items Now" : "Add Remaining Items"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...neumorphicStyles.raised,
    borderRadius: 28,
    padding: spacing.lg,
    marginBottom: spacing.xl,
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
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: homeTokens.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  headerLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: homeTokens.textSecondary,
  },
  statusBadge: {
    backgroundColor: homeTokens.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
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
    color: homeTokens.textPrimary,
  },
  statusTextComplete: {
    color: colors.success,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 22,
    fontWeight: "700",
    color: homeTokens.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    fontSize: 13,
    color: "#666460",
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  rowsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  reqRow: {
    ...neumorphicStyles.subtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: homeTokens.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  iconBoxComplete: {
    backgroundColor: "rgba(63, 125, 88, 0.08)",
    borderColor: "rgba(63, 125, 88, 0.2)",
  },
  textGroup: {
    justifyContent: "center",
  },
  categoryName: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 15,
    fontWeight: "700",
    color: homeTokens.textPrimary,
    marginBottom: 2,
  },
  categorySub: {
    ...typography.caption,
    fontSize: 12,
    color: homeTokens.textSecondary,
  },
  countBadge: {
    backgroundColor: homeTokens.surface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  countBadgeComplete: {
    backgroundColor: "rgba(63, 125, 88, 0.15)",
    borderColor: "rgba(63, 125, 88, 0.3)",
  },
  countBadgeText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 14,
    fontWeight: "700",
    color: homeTokens.textPrimary,
  },
  countBadgeTextComplete: {
    color: colors.success,
  },
  ctaButton: {
    ...neumorphicStyles.elevatedDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 48,
    borderRadius: radius.full,
  },
  ctaButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
