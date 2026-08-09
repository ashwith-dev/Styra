/**
 * Generated outfit result screen.
 *
 * Displays the selected outfit with items, score breakdown,
 * AI explanation, Wear Today, Save, and Regenerate actions.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CachedImage } from "@/components/ui/CachedImage";
import { colors, spacing, radius, typography } from "@/theme";
import type {
  OutfitGenerationResponse,
  OutfitItemResponse,
} from "@/lib/types";
import { addOutfitFavorite, wearOutfitToday } from "@/lib/api";
import { useTodayOutfit, todayString } from "@/hooks/useTodayOutfit";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface GeneratedOutfitScreenProps {
  result: OutfitGenerationResponse;
  targetDate?: string;
  onRegenerate: () => void;
  onClose: () => void;
  onSaved?: () => void;
}

const SLOT_ORDER = ["top", "bottom", "dress", "footwear", "outerwear"];

export function GeneratedOutfitScreen({
  result,
  targetDate,
  onRegenerate,
  onClose,
  onSaved,
}: GeneratedOutfitScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const savedRef = useRef(false);
  const [wearing, setWearing] = useState(false);
  const [worn, setWorn] = useState(false);
  const { saveTodayOutfit } = useTodayOutfit();

  const effectiveDate = targetDate || todayString();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Memoized so the callbacks below don't get a new identity every render.
  const { mainSlots, accessories } = useMemo(() => {
    const main: OutfitItemResponse[] = [];
    const acc: OutfitItemResponse[] = [];
    for (const slot of SLOT_ORDER) {
      const item = result.outfit[slot];
      if (item && !Array.isArray(item)) {
        main.push(item as OutfitItemResponse);
      }
    }
    const accRaw = result.outfit["accessories"];
    if (Array.isArray(accRaw)) {
      acc.push(...(accRaw as OutfitItemResponse[]));
    }
    return { mainSlots: main, accessories: acc };
  }, [result]);

  // Pending "Worn Today ✓" → /home navigation — cancelled on unmount so a
  // manual back-press within the 1s window isn't yanked back to /home.
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  const handleSave = useCallback(async () => {
    if (savedRef.current) return;
    try {
      const outfitId = `outfit-${effectiveDate}`;
      await addOutfitFavorite({
        outfit_id: outfitId,
        outfit_data: {
          outfit_id: outfitId,
          outfit_items: [...mainSlots, ...accessories].map((item) => ({
            id: item.id,
            attributes: item.attributes,
            thumbnail_url: item.thumbnail_url || null,
          })),
          score: result.score.overall,
          explanation: result.stylist.reason,
          outfit_category: "generated",
        },
      });
      savedRef.current = true;
      onSaved?.();
    } catch (err) {
      if ((err as { statusCode?: number })?.statusCode === 409) {
        savedRef.current = true;
        onSaved?.();
      }
    }
  }, [mainSlots, accessories, result, effectiveDate, onSaved]);

  const handleWearToday = useCallback(async () => {
    if (wearing || worn) return;
    setWearing(true);
    try {
      const outfitId = result.metadata.request_id || `gen-${Date.now()}`;
      try {
        await wearOutfitToday(outfitId, effectiveDate);
      } catch (err) {
        if ((err as { statusCode?: number })?.statusCode !== 409) throw err;
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await wearOutfitToday(outfitId, effectiveDate);
      }
      const allItems = [...mainSlots, ...accessories];
      await saveTodayOutfit({
        items: allItems,
        score: result.score.overall,
        reason: result.stylist.reason,
      }, effectiveDate);
      setWorn(true);
      navTimerRef.current = setTimeout(() => {
        router.replace("/home");
      }, 1000);
    } catch {
      // best-effort
    } finally {
      setWearing(false);
    }
  }, [wearing, worn, result, mainSlots, accessories, effectiveDate, saveTodayOutfit]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Outfit</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>OVERALL SCORE</Text>
          <Text style={styles.scoreValue}>{result.score.overall.toFixed(0)}</Text>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${Math.min(result.score.overall, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.scoreContext}>
            {result.metadata.wardrobe_items_count} items ·{" "}
            {result.metadata.candidates_generated} combinations ·{" "}
            {(result.metadata.generation_time_ms / 1000).toFixed(1)}s
          </Text>
        </View>

        {/* Outfit Items */}
        <Text style={styles.sectionLabel}>ITEMS</Text>
        {mainSlots.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            {item.thumbnail_url ? (
              <CachedImage
                uri={item.thumbnail_url}
                style={styles.itemImage}
              />
            ) : (
              <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                <Ionicons
                  name="shirt-outline"
                  size={24}
                  color={colors.textSecondary}
                />
              </View>
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemCategory}>
                {item.category?.toUpperCase()}
              </Text>
              <Text style={styles.itemType}>{item.type || "Item"}</Text>
              {item.color && (
                <Text style={styles.itemColor}>{item.color}</Text>
              )}
            </View>
          </View>
        ))}

        {accessories.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>ACCESSORIES</Text>
            {accessories.map((item) => (
              <View key={item.id} style={styles.accessoryRow}>
                <Ionicons name="add-circle-outline" size={16} color={colors.accent} />
                <Text style={styles.accessoryText}>
                  {item.type || item.category || "Accessory"}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Stylist */}
        <Text style={styles.sectionLabel}>AI INSIGHT</Text>
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="sparkles" size={16} color={colors.accent} />
            <Text style={styles.insightType}>
              {result.metadata.used_gemini ? "Gemini Stylist" : "Smart Match"}
              {result.metadata.fallback_used ? " (Fallback)" : ""}
            </Text>
          </View>
          <Text style={styles.insightReason}>{result.stylist.reason}</Text>
          {result.stylist.tips.length > 0 && (
            <View style={styles.tipsContainer}>
              {result.stylist.tips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Ionicons name="bulb-outline" size={14} color={colors.warning} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>


      </ScrollView>

      {/* Footer — two-row layout */}
      <View style={styles.footer}>
        {/* Primary CTA: full-width Wear Today */}
        <TouchableOpacity
          style={[styles.wearBtn, worn && styles.wearBtnWorn]}
          onPress={handleWearToday}
          disabled={wearing || worn}
          activeOpacity={0.8}
        >
          {wearing ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <Ionicons
              name={worn ? "checkmark-circle" : "sunny-outline"}
              size={18}
              color={colors.surface}
            />
          )}
          <Text style={styles.wearBtnText} numberOfLines={1}>
            {worn
              ? "Saved for Date ✓"
              : effectiveDate === todayString()
              ? "Wear Today"
              : `Save for ${effectiveDate}`}
          </Text>
        </TouchableOpacity>

        {/* Secondary row: Save + Regenerate */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Ionicons name="bookmark-outline" size={15} color={colors.textPrimary} />
            <Text style={styles.secondaryBtnText} numberOfLines={1}>Save</Text>
          </TouchableOpacity>

          <View style={styles.secondaryDivider} />

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onRegenerate}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={15} color={colors.accent} />
            <Text style={[styles.secondaryBtnText, { color: colors.accent }]} numberOfLines={1}>Regenerate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  closeButton: {
    width: 40,
    alignItems: "center",
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  scoreCard: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.sm,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  scoreLabel: {
    ...typography.label,
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  scoreValue: {
    ...typography.display,
    color: colors.surface,
    fontSize: 64,
    lineHeight: 72,
    marginVertical: spacing.xs,
  },
  scoreBar: {
    width: SCREEN_WIDTH * 0.5,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: 2,
  },
  scoreContext: {
    ...typography.caption,
    color: "rgba(255,255,255,0.5)",
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  itemImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: "center",
  },
  itemCategory: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 11,
  },
  itemType: {
    ...typography.body,
    color: colors.textPrimary,
  },
  itemColor: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  accessoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  accessoryText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  insightCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  insightType: {
    ...typography.label,
    color: colors.accent,
    fontSize: 12,
  },
  insightReason: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  tipsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  tipText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  wearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    paddingVertical: 14,
  },
  wearBtnWorn: {
    backgroundColor: colors.success,
  },
  wearBtnText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: colors.surface,
  },
  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 13,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  secondaryDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
});
