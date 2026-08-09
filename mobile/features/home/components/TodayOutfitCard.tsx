/**
 * TodayOutfitCard.tsx
 *
 * Displays the outfit marked as "Worn Today" on the home screen.
 * Exactly matches user sketch #1:
 * - Centered "── Todays outfit ──" title header
 * - Top-left "match score" pill & Top-right Edit button inside card
 * - 2×2 grid of clothing item boxes
 * - Integrated 3-button bottom footer: [ 🗑️ Trash ] | [ Regenerate ] | [ 🔖 Save/Unsave ]
 *
 * Save button states:
 * - Unsaved: "Save" (bookmark icon)
 * - Tap Save: "Saved ✓" (green checkmark for 2 seconds)
 * - After 2s: "Unsave" (bookmark icon) -> tapping unsaves from DB and Saved screen
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CachedImage } from "@/components/ui/CachedImage";
import { colors, radius, spacing, typography } from "@/theme";
import { homeTokens, neumorphicStyles } from "../theme/homeTokens";
import type { TodayOutfitData } from "@/hooks/useTodayOutfit";

interface TodayOutfitCardProps {
  outfit: TodayOutfitData;
  title?: string;
  isReadOnly?: boolean;
  onSave?: () => void;
  onUnsave?: () => void;
  onEditOutfit?: () => void;
  onRegenerate?: () => void;
  onDeleteOutfit?: () => void;
  isInitiallySaved?: boolean;
}

export function TodayOutfitCard({
  outfit,
  title,
  isReadOnly = false,
  onSave,
  onUnsave,
  onEditOutfit,
  onRegenerate,
  onDeleteOutfit,
  isInitiallySaved = false,
}: TodayOutfitCardProps) {
  // 'unsaved' | 'just_saved' | 'saved'
  const [saveStatus, setSaveStatus] = useState<"unsaved" | "just_saved" | "saved">(
    isInitiallySaved ? "saved" : "unsaved",
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync saveStatus when isInitiallySaved changes from parent
  useEffect(() => {
    if (saveStatus !== "just_saved") {
      setSaveStatus(isInitiallySaved ? "saved" : "unsaved");
    }
  }, [isInitiallySaved]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);


  // Take at most 4 items
  const items = outfit.items.slice(0, 4);

  // Row 1: items[0] and items[1]
  // Row 2: items[2] and items[3]
  const row1 = [items[0] || null, items[1] || null];
  const row2 = items.length > 2 ? [items[2] || null, items[3] || null] : [];

  const handleSaveToggle = useCallback(() => {
    if (saveStatus === "unsaved") {
      // Transition to just_saved (show checkmark for 2 seconds)
      setSaveStatus("just_saved");
      onSave?.();

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setSaveStatus("saved");
      }, 2000);
    } else if (saveStatus === "saved") {
      // Transition back to unsaved
      setSaveStatus("unsaved");
      onUnsave?.();
    }
  }, [saveStatus, onSave, onUnsave]);

  const renderCell = useCallback((item: (typeof items)[0] | null, index: number) => {
    if (!item) return <View key={index} style={styles.gridCellEmpty} />;

    const uri = item.thumbnail_url ?? item.image_url ?? null;
    return (
      <View key={item.id || index} style={styles.gridCell}>
        <View style={styles.imageContainer}>
          {uri ? (
            <CachedImage uri={uri} style={styles.gridImage} resizeMode="cover" />
          ) : (
            <View style={styles.gridPlaceholder}>
              <Ionicons name="shirt-outline" size={24} color={colors.textSecondary} />
            </View>
          )}
        </View>
        <Text style={styles.gridLabel} numberOfLines={1}>
          {item.type ?? item.category ?? "Item"}
        </Text>
      </View>
    );
  }, []);

  return (
    <View style={styles.wrapper}>
      {/* Centered Header matching Sketch 1: ── Todays outfit ── */}
      <View style={styles.titleDividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.sectionTitle}>{title || (isReadOnly ? "Past outfit" : "Todays outfit")}</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        {/* Card Header matching Sketch 1: Top-Left Match Score pill, Top-Right Edit Pencil button */}
        <View style={styles.cardHeader}>
          <View style={styles.matchScorePill}>
            <Text style={styles.matchScoreText}>{outfit.score.toFixed(0)} match score</Text>
          </View>

          {!isReadOnly && (
            <TouchableOpacity
              style={styles.editPencilBtn}
              onPress={onEditOutfit}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="create-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>

        {/* 2×2 Image Grid */}
        <View style={styles.gridRow}>
          {row1.map((item, idx) => renderCell(item, idx))}
        </View>

        {row2.length > 0 && (
          <View style={styles.gridRow}>
            {row2.map((item, idx) => renderCell(item, idx + 2))}
          </View>
        )}

        {/* Integrated 3-button Footer matching Sketch 1 */}
        <View style={styles.actionsFooter}>
          {!isReadOnly ? (
            <>
              {/* Button 1: Trash / Delete */}
              <TouchableOpacity style={styles.actionBtnTrash} onPress={onDeleteOutfit} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={18} color={colors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.actionDivider} />

              {/* Button 2: Regenerate */}
              <TouchableOpacity style={styles.actionBtnCenter} onPress={onRegenerate} activeOpacity={0.7}>
                <Text style={styles.actionTextCenter}>Regenerate</Text>
              </TouchableOpacity>

              <View style={styles.actionDivider} />
            </>
          ) : (
            <View style={[styles.actionBtnCenter, { paddingHorizontal: spacing.md }]}>
              <Text style={[styles.actionTextCenter, { color: "#7F7C76", fontSize: 12 }]}>
                🔒 Worn Outfit Record
              </Text>
            </View>
          )}

          {/* Button 3: Save / Saved ✓ (2s) / Unsave */}
          <TouchableOpacity
            style={styles.actionBtnSave}
            onPress={handleSaveToggle}
            activeOpacity={0.7}
            disabled={saveStatus === "just_saved"}
          >
            <Ionicons
              name={
                saveStatus === "just_saved"
                  ? "checkmark-circle"
                  : saveStatus === "saved"
                  ? "bookmark"
                  : "bookmark-outline"
              }
              size={16}
              color={
                saveStatus === "just_saved"
                  ? colors.success
                  : saveStatus === "saved"
                  ? colors.accent
                  : colors.textPrimary
              }
            />
            <Text
              style={[
                styles.actionTextSave,
                saveStatus === "just_saved" && { color: colors.success },
                saveStatus === "saved" && { color: colors.accent },
              ]}
            >
              {saveStatus === "just_saved" ? "Saved ✓" : saveStatus === "saved" ? "Unsave" : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  titleDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
  },
  card: {
    ...neumorphicStyles.raised,
    borderRadius: 28,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  matchScorePill: {
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    backgroundColor: colors.surface,
  },
  matchScoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  editPencilBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  gridRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gridCell: {
    flex: 1,
    alignItems: "center",
  },
  gridCellEmpty: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: "#F7F5F0",
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F5F0",
  },
  gridLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "600",
    marginTop: 6,
    fontSize: 11,
    textAlign: "center",
  },
  actionsFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    marginHorizontal: -spacing.md,
    marginTop: spacing.xs,
  },
  actionBtnTrash: {
    width: 54,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnCenter: {
    flex: 1,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextCenter: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  actionBtnSave: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 13,
  },
  actionTextSave: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
});
