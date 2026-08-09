import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
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

      {/* Wardrobe Progress Card */}
      <View style={styles.progressCard}>
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

      {/* Already Added Clothing Strip (If items exist) */}
      {recentItems.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>RECENTLY ADDED</Text>
            <TouchableOpacity onPress={onViewWardrobe} activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All ({recentItems.length})</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemsScrollContent}
          >
            {recentItems.map((item) => {
              const imgUrl = getItemImage(item);
              const title = getItemTitle(item);
              const sub = getItemSub(item);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => onItemPress(item.id)}
                  style={styles.itemCard}
                  activeOpacity={0.85}
                >
                  <View style={styles.itemImageContainer}>
                    {imgUrl ? (
                      <Image
                        source={{ uri: imgUrl }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons
                        name="shirt-outline"
                        size={28}
                        color="#A09D96"
                      />
                    )}
                  </View>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text style={styles.itemMeta} numberOfLines={1}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Locked AI Outfit Generator Card */}
      <View style={styles.lockedCard}>
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
              size={26}
              color={colors.textPrimary}
            />
          </View>
          <Text style={styles.lockedVisualTitle}>AI Outfit Generator</Text>
          <Text style={styles.lockedVisualSubtitle}>
            Locked — Unlock by adding: 2 Tops, 2 Bottoms, 1 Footwear
          </Text>
        </View>

        {/* Progress Requirements Pills */}
        <View style={styles.requirementsRow}>
          <View
            style={[
              styles.reqPill,
              topsCount >= requiredTops && styles.completedReqPill,
            ]}
          >
            <Ionicons
              name={
                topsCount >= requiredTops
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={14}
              color={
                topsCount >= requiredTops
                  ? colors.textPrimary
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.reqPillText,
                topsCount >= requiredTops && styles.completedReqPillText,
              ]}
            >
              Tops: {topsCount}/{requiredTops}
            </Text>
          </View>

          <View
            style={[
              styles.reqPill,
              bottomsCount >= requiredBottoms && styles.completedReqPill,
            ]}
          >
            <Ionicons
              name={
                bottomsCount >= requiredBottoms
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={14}
              color={
                bottomsCount >= requiredBottoms
                  ? colors.textPrimary
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.reqPillText,
                bottomsCount >= requiredBottoms && styles.completedReqPillText,
              ]}
            >
              Bottoms: {bottomsCount}/{requiredBottoms}
            </Text>
          </View>

          <View
            style={[
              styles.reqPill,
              footwearCount >= requiredFootwear && styles.completedReqPill,
            ]}
          >
            <Ionicons
              name={
                footwearCount >= requiredFootwear
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={14}
              color={
                footwearCount >= requiredFootwear
                  ? colors.textPrimary
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.reqPillText,
                footwearCount >= requiredFootwear && styles.completedReqPillText,
              ]}
            >
              Footwear: {footwearCount}/{requiredFootwear}
            </Text>
          </View>
        </View>
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
    backgroundColor: colors.surface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#EFECE6",
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
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
  lockedCard: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#EFECE6",
    padding: spacing.lg,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FAF8F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  lockedBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  lockedVisualContainer: {
    backgroundColor: "#FAF8F5",
    borderRadius: 24,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EFECE6",
    marginBottom: spacing.md,
  },
  lockIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
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
  },
  requirementsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  reqPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FAF8F5",
    paddingVertical: 10,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  completedReqPill: {
    borderColor: colors.textPrimary,
  },
  reqPillText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  completedReqPillText: {
    color: colors.textPrimary,
  },
});
