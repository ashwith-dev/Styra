import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
import { homeTokens, neumorphicStyles } from "../theme/homeTokens";
import type { ClothingItemBrief } from "@/lib/types";

interface InsufficientWardrobeDashboardProps {
  topsCount: number;
  requiredTops: number;
  bottomsCount: number;
  requiredBottoms: number;
  footwearCount?: number;
  requiredFootwear?: number;
  topsProgress: number;
  bottomsProgress: number;
  footwearProgress?: number;
  recentItems: ClothingItemBrief[];
  onAddClothing: () => void;
  onItemPress: (id: string) => void;
  onViewWardrobe: () => void;
}

export function InsufficientWardrobeDashboard({
  topsCount,
  requiredTops,
  bottomsCount,
  requiredBottoms,
  footwearCount = 0,
  requiredFootwear = 1,
  topsProgress,
  bottomsProgress,
  footwearProgress = 0,
  recentItems,
  onAddClothing,
  onItemPress,
  onViewWardrobe,
}: InsufficientWardrobeDashboardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Animated progress bar fills
  const topsFillWidth = useRef(new Animated.Value(0)).current;
  const bottomsFillWidth = useRef(new Animated.Value(0)).current;
  const footwearFillWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(topsFillWidth, {
        toValue: Math.min(1, topsProgress),
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(bottomsFillWidth, {
        toValue: Math.min(1, bottomsProgress),
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(footwearFillWidth, {
        toValue: Math.min(1, footwearProgress),
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, [
    fadeAnim,
    slideAnim,
    topsFillWidth,
    bottomsFillWidth,
    footwearFillWidth,
    topsProgress,
    bottomsProgress,
    footwearProgress,
  ]);

  const topsWidthInterpolated = topsFillWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const bottomsWidthInterpolated = bottomsFillWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const footwearWidthInterpolated = footwearFillWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const getItemImage = (item: ClothingItemBrief): string | null => {
    return item.thumbnail_url || item.segmented_image_url || item.original_image_url || null;
  };

  const getItemTitle = (item: ClothingItemBrief): string => {
    const attrs = item.attributes || {};
    const typeVal = typeof attrs.type === "object" && attrs.type ? (attrs.type as any).value : attrs.type;
    const catVal = typeof attrs.category === "object" && attrs.category ? (attrs.category as any).value : attrs.category;
    return String(typeVal || catVal || "Clothing Item");
  };

  const getItemSub = (item: ClothingItemBrief): string => {
    const attrs = item.attributes || {};
    const colorVal = typeof attrs.color === "object" && attrs.color ? (attrs.color as any).value : attrs.color;
    const catVal = typeof attrs.category === "object" && attrs.category ? (attrs.category as any).value : attrs.category;
    return String(colorVal || catVal || "Item");
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Title & Subtitle */}
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headingTitle}>Almost There</Text>
        <Text style={styles.headingSubtitle}>
          Add at least 2 tops, 2 bottoms, and 1 footwear item to unlock AI outfit generation.
        </Text>
      </View>

      {/* Unified AI Outfit Generator & Wardrobe Progress Card */}
      <View style={styles.progressCard}>
        {/* Top Header: Tag & Locked Badge */}
        <View style={styles.lockedCardHeader}>
          <Text style={styles.lockedCardTag}>STITCH - DESIGN WITH AI</Text>
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.textPrimary} />
            <Text style={styles.lockedBadgeText}>LOCKED</Text>
          </View>
        </View>

        {/* Visual Hero Area */}
        <View style={styles.lockedVisualContainer}>
          <View style={styles.lockIconCircle}>
            <Ionicons
              name="lock-closed-outline"
              size={24}
              color={colors.textPrimary}
            />
          </View>
          <Text style={styles.lockedVisualTitle}>AI Outfit Generator</Text>
          <Text style={styles.lockedVisualSubtitle}>
            Locked — Unlock by adding: 2 Tops, 2 Bottoms, 1 Footwear
          </Text>
        </View>

        {/* Section Divider */}
        <View style={styles.sectionDivider} />

        {/* Wardrobe Progress Section */}
        <View style={styles.progressCardHeader}>
          <Text style={styles.progressCardHeaderLabel}>WARDROBE PROGRESS</Text>
          <Ionicons name="analytics-outline" size={18} color="#7F7C76" />
        </View>

        {/* Tops Progress Row */}
        <View style={styles.counterRow}>
          <View style={styles.counterLabelRow}>
            <Text style={styles.counterTitle}>Tops</Text>
            <Text style={styles.counterValueText}>
              {topsCount} / {requiredTops}
            </Text>
          </View>

          <View style={styles.trackBg}>
            <Animated.View
              style={[styles.trackFill, { width: topsWidthInterpolated }]}
            />
          </View>

          <View style={styles.dotsRow}>
            <View
              style={[styles.dot, topsCount >= 1 && styles.activeDot]}
            />
            <View
              style={[styles.dot, topsCount >= 2 && styles.activeDot]}
            />
          </View>
        </View>

        {/* Bottoms Progress Row */}
        <View style={styles.counterRow}>
          <View style={styles.counterLabelRow}>
            <Text style={styles.counterTitle}>Bottoms</Text>
            <Text style={styles.counterValueText}>
              {bottomsCount} / {requiredBottoms}
            </Text>
          </View>

          <View style={styles.trackBg}>
            <Animated.View
              style={[styles.trackFill, { width: bottomsWidthInterpolated }]}
            />
          </View>

          <View style={styles.dotsRow}>
            <View
              style={[styles.dot, bottomsCount >= 1 && styles.activeDot]}
            />
            <View
              style={[styles.dot, bottomsCount >= 2 && styles.activeDot]}
            />
          </View>
        </View>

        {/* Footwear Progress Row */}
        <View style={styles.counterRow}>
          <View style={styles.counterLabelRow}>
            <Text style={styles.counterTitle}>Footwear</Text>
            <Text style={styles.counterValueText}>
              {footwearCount} / {requiredFootwear}
            </Text>
          </View>

          <View style={styles.trackBg}>
            <Animated.View
              style={[styles.trackFill, { width: footwearWidthInterpolated }]}
            />
          </View>

          <View style={styles.dotsRow}>
            <View
              style={[styles.dot, footwearCount >= 1 && styles.activeDot]}
            />
          </View>
        </View>

        {/* Add More Clothing CTA */}
        <TouchableOpacity
          onPress={onAddClothing}
          style={styles.addMoreBtn}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Add More Clothing"
          testID="insufficient-wardrobe-add-more-cta"
        >
          <Ionicons name="add" size={18} color={colors.textPrimary} />
          <Text style={styles.addMoreBtnText}>Add More Items</Text>
        </TouchableOpacity>
      </View>

      {/* Informational Card 1: The Capsule Formula */}
      <View style={styles.featureCard}>
        <View style={styles.iconCircle}>
          <Ionicons name="layers-outline" size={18} color={colors.textPrimary} />
        </View>
        <Text style={styles.featureLabel}>THE CAPSULE FORMULA</Text>
        <Text style={styles.featureTitle}>5 Pieces, 4 Daily Looks</Text>
        <Text style={styles.featureBody}>
          With 2 tops, 2 bottoms, and 1 footwear item, STYRA unlocks 4 complete outfits. Every added piece multiplies your rotation.
        </Text>
      </View>

      {/* Informational Card 2: Photo Guidelines */}
      <View style={styles.featureCard}>
        <View style={styles.iconCircle}>
          <Ionicons name="camera-outline" size={18} color={colors.textPrimary} />
        </View>
        <Text style={styles.featureLabel}>PHOTO GUIDELINES</Text>
        <Text style={styles.featureTitle}>Natural Light & Flat Lay</Text>
        <Text style={styles.featureBody}>
          Photograph one piece at a time in daylight on a flat surface for true color accuracy and clean silhouette detection.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.massive,
  },
  headerTitleContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  headingTitle: {
    fontFamily: "serif",
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  headingSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 320,
  },
  progressCard: {
    ...neumorphicStyles.raised,
    borderRadius: 32,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  progressCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  progressCardHeaderLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: "#7F7C76",
    textTransform: "uppercase",
  },
  counterRow: {
    marginBottom: spacing.lg,
  },
  counterLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  counterTitle: {
    fontFamily: "serif",
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  counterValueText: {
    fontFamily: "serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  trackBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EAE7E1",
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  trackFill: {
    height: "100%",
    backgroundColor: colors.textPrimary,
    borderRadius: 4,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D0CDC7",
  },
  activeDot: {
    backgroundColor: colors.textPrimary,
  },
  addMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: "#FAF8F5",
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "#EFECE6",
    marginTop: spacing.xs,
  },
  addMoreBtnText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: "#7F7C76",
    textTransform: "uppercase",
  },
  viewAllText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  itemsScrollContent: {
    gap: spacing.md,
  },
  itemCard: {
    width: 120,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  itemImageContainer: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    backgroundColor: "#FAF8F5",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemName: {
    fontFamily: "serif",
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    paddingHorizontal: 2,
  },
  itemMeta: {
    ...typography.caption,
    fontSize: 11,
    color: "#787571",
    paddingHorizontal: 2,
  },
  lockedCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  lockedCardTag: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#787571",
    textTransform: "uppercase",
  },
  lockedBadge: {
    ...neumorphicStyles.subtle,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  lockedBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  lockedVisualContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  lockIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(20, 20, 18, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  lockedVisualTitle: {
    fontFamily: "serif",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  lockedVisualSubtitle: {
    ...typography.body,
    fontSize: 13,
    fontStyle: "italic",
    color: "#787571",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(20, 20, 18, 0.07)",
    marginVertical: spacing.lg,
  },
  featureCard: {
    ...neumorphicStyles.raised,
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    ...neumorphicStyles.subtle,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  featureLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  featureTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  featureBody: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
