import { memo, useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getCachedRecommendation, cacheRecommendations, addDislikedOutfit, prefetchImages } from "../../hooks/useRecommendations";
import * as api from "../../lib/api";
import { getUserFacingMessage } from "../../lib/errors";
import { Button, CachedImage } from "../../components/ui";
import { colors, fontSize, fontWeight, spacing, borderRadius } from "../../lib/theme";

function attrValue(attrs: Record<string, unknown>, key: string): string {
  const v = (attrs[key] as any)?.value;
  return typeof v === "string" ? v : "";
}

function itemLabel(attrs: Record<string, unknown>): string {
  const color = attrValue(attrs, "color");
  const type = attrValue(attrs, "type");
  return [color, type].filter(Boolean).join(" ") || "Item";
}

// ── Memoised outfit item row ──

const OutfitItemRow = memo(function OutfitItemRow({ item }: { item: any }) {
  return (
    <TouchableOpacity
      style={styles.itemRow}
      activeOpacity={0.7}
      onPress={() => router.push(`/items/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${itemLabel(item.attributes)}, ${attrValue(item.attributes, "category")}`}
      accessibilityHint="View item details"
    >
      <CachedImage
        uri={item.thumbnail_url}
        style={styles.itemThumb}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{itemLabel(item.attributes)}</Text>
        <Text style={styles.itemCategory}>
          {attrValue(item.attributes, "category")}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
});

// ── Memoised outfit items section ──

const OutfitItemsSection = memo(function OutfitItemsSection({ items }: { items: any[] }) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Items in this outfit</Text>
      {items.map((item) => (
        <OutfitItemRow key={item.id} item={item} />
      ))}
    </View>
  );
});

// ── Memoised feedback section ──

const FeedbackSection = memo(function FeedbackSection({
  feedback,
  onFeedback,
}: {
  feedback: "like" | "dislike" | null;
  onFeedback: (type: "like" | "dislike") => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>How is this outfit?</Text>
      <View style={styles.feedbackRow}>
        <TouchableOpacity
          style={[
            styles.feedbackButton,
            feedback === "like" && styles.feedbackButtonActive,
          ]}
          onPress={() => onFeedback("like")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Like this outfit"
          accessibilityState={{ selected: feedback === "like" }}
        >
          <Text style={styles.feedbackIcon}>👍</Text>
          <Text
            style={[
              styles.feedbackLabel,
              feedback === "like" && styles.feedbackLabelActive,
            ]}
          >
            Like
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.feedbackButton,
            feedback === "dislike" && styles.feedbackButtonDislikeActive,
          ]}
          onPress={() => onFeedback("dislike")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Dislike this outfit"
          accessibilityState={{ selected: feedback === "dislike" }}
        >
          <Text style={styles.feedbackIcon}>👎</Text>
          <Text
            style={[
              styles.feedbackLabel,
              feedback === "dislike" && styles.feedbackLabelDislikeActive,
            ]}
          >
            Dislike
          </Text>
        </TouchableOpacity>
      </View>
      {feedback && (
        <Text style={styles.feedbackConfirmation}>
          {feedback === "like"
            ? "Thanks! We'll show you more like this."
            : "Got it. You won't see this outfit again."}
        </Text>
      )}
    </View>
  );
});

// ── Main screen ──

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const index = parseInt(id, 10);
  const rec = getCachedRecommendation(index);
  const [regenerating, setRegenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Prefetch outfit item images when the rec loads.
  useEffect(() => {
    if (rec) {
      const urls = rec.outfit_items.map((i) => i.thumbnail_url);
      prefetchImages(urls);
    }
  }, [rec]);

  // Check saved state on mount.
  useEffect(() => {
    if (!rec) return;
    let cancelled = false;
    api.checkOutfitFavorite(rec.outfit_id).then((isSaved) => {
      if (!cancelled) setSaved(isSaved);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [rec?.outfit_id]);

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true);
    setActionError(null);
    try {
      const data = await api.getOutfitRecommendations();
      cacheRecommendations(data.recommendations);
      router.back();
    } catch (err) {
      setActionError(getUserFacingMessage(err));
    } finally {
      setRegenerating(false);
    }
  }, []);

  const handleFeedback = useCallback(async (type: "like" | "dislike") => {
    if (!rec) return;
    setActionError(null);
    try {
      await api.submitOutfitFeedback({ outfit_id: rec.outfit_id, feedback: type });
      setFeedback(type);
      if (type === "dislike") {
        addDislikedOutfit(rec.outfit_id);
      }
    } catch (err) {
      setActionError(getUserFacingMessage(err));
    }
  }, [rec]);

  const handleSave = useCallback(async () => {
    if (!rec || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      if (saved) {
        await api.removeOutfitFavorite(rec.outfit_id);
        setSaved(false);
      } else {
        await api.addOutfitFavorite({
          outfit_id: rec.outfit_id,
          outfit_data: rec,
        });
        setSaved(true);
      }
    } catch (err) {
      setActionError(getUserFacingMessage(err));
    } finally {
      setSaving(false);
    }
  }, [rec, saved, saving]);

  if (!rec) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Outfit not found.</Text>
        <Button label="Go Back" onPress={() => router.replace("/recommendations")} variant="outline" />
      </View>
    );
  }

  const scoreColor =
    rec.score >= 70 ? "#2E7D32" : rec.score >= 40 ? "#E65100" : colors.error;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back to recommendations"
          >
            <Text style={styles.backLabel}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Category + Score */}
        <View style={styles.hero}>
          <Text style={styles.categoryBadge}>
            {formatCategory(rec.outfit_category)}
          </Text>
          <View style={styles.scoreRing}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {rec.score.toFixed(0)}
            </Text>
            <Text style={styles.scoreUnit}>% match</Text>
          </View>
        </View>

        {/* Outfit items */}
        <OutfitItemsSection items={rec.outfit_items} />

        {/* AI Explanation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why this outfit?</Text>
          <Text style={styles.explanation}>{rec.explanation}</Text>
        </View>

        {/* Feedback */}
        <FeedbackSection feedback={feedback} onFeedback={handleFeedback} />
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        {actionError && (
          <Text style={styles.actionError}>{actionError}</Text>
        )}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.saveButton, saved && styles.saveButtonActive]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={saved ? "Unsave outfit" : "Save outfit"}
          >
            <Text style={[styles.saveIcon, saved && styles.saveIconActive]}>
              {saved ? "\u2605" : "\u2606"}
            </Text>
            <Text style={[styles.saveLabel, saved && styles.saveLabelActive]}>
              {saved ? "Saved" : "Save Outfit"}
            </Text>
          </TouchableOpacity>
          <View style={styles.regenerateWrapper}>
            <Button
              label="Generate Another"
              onPress={handleRegenerate}
              loading={regenerating}
              disabled={regenerating}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function formatCategory(cat: string): string {
  return cat
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  notFoundText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    minWidth: 44,
    minHeight: 44,
  },
  backLabel: {
    fontSize: fontSize.md,
    color: colors.link,
  },
  hero: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  categoryBadge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  scoreRing: {
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
  },
  scoreUnit: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: -4,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  itemThumb: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  itemCategory: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "capitalize",
    marginTop: 2,
  },
  chevron: {
    fontSize: fontSize.xl,
    color: colors.textTertiary,
  },
  explanation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  feedbackRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  feedbackButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  feedbackButtonDislikeActive: {
    borderColor: colors.error,
    backgroundColor: colors.errorBackground,
  },
  feedbackIcon: {
    fontSize: fontSize.lg,
  },
  feedbackLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  feedbackLabelActive: {
    color: colors.text,
  },
  feedbackLabelDislikeActive: {
    color: colors.error,
  },
  feedbackConfirmation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
    gap: spacing.xs,
  },
  saveButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  saveIcon: {
    fontSize: fontSize.lg,
    color: colors.textTertiary,
  },
  saveIconActive: {
    color: colors.primary,
  },
  saveLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  saveLabelActive: {
    color: colors.text,
  },
  regenerateWrapper: {
    flex: 1,
  },
  actionError: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
});
