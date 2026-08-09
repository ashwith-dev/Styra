import { memo } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SavedLook } from "../types/looks";
import { formatSavedTimestamp } from "../utils/dateGrouping";
import { OutfitCollagePreview } from "./OutfitCollagePreview";
import { colors, radius, spacing, typography } from "@/theme";

interface SavedLookCardProps {
  look: SavedLook;
  onWearAgain: (look: SavedLook) => void;
  onEdit: (look: SavedLook) => void;
}

export const SavedLookCard = memo(function SavedLookCard({
  look,
  onWearAgain,
  onEdit,
}: SavedLookCardProps) {
  const tags = [
    look.category,
    look.season,
    ...(look.tags || []),
  ].filter(Boolean) as string[];

  const timestampText = formatSavedTimestamp(look.created_at);

  return (
    <View style={styles.cardContainer} testID={`saved-look-card-${look.id}`}>
      {/* Top Header: Style Tags + Bookmark Icon */}
      <View style={styles.topRow}>
        <View style={styles.tagsContainer}>
          {tags.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Saved bookmark"
        >
          <Ionicons name="bookmark" size={20} color="#C86446" />
        </TouchableOpacity>
      </View>

      {/* Dynamic Outfit Collage Preview */}
      <OutfitCollagePreview items={look.items || []} />

      {/* Saved Timestamp */}
      <View style={styles.infoSection}>
        <Text style={styles.timestamp}>{timestampText}</Text>
      </View>

      {/* Buttons: Secondary Edit Outfit + Primary Wear Again */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          onPress={() => onEdit(look)}
          style={styles.editBtn}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Edit Outfit"
        >
          <Text style={styles.editBtnText}>Edit Outfit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onWearAgain(look)}
          style={styles.wearAgainBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Wear Again"
        >
          <Text style={styles.wearAgainBtnText}>Wear Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#F7F5F0",
    borderRadius: 26,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  tagChip: {
    backgroundColor: "#F7F5F0",
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderWidth: 0,
    boxShadow: "-3px -3px 8px #FFFFFF, 3px 3px 8px rgba(185, 175, 158, 0.5)",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  } as ViewStyle & { boxShadow?: string },
  tagText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.textPrimary,
  },
  infoSection: {
    marginBottom: spacing.md,
  },
  timestamp: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#7F7C76",
    textTransform: "uppercase",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#F7F5F0",
    borderWidth: 0,
    borderRadius: radius.full,
    paddingVertical: 12,
    alignItems: "center",
    boxShadow: "-4px -4px 10px #FFFFFF, 4px 4px 10px rgba(185, 175, 158, 0.55)",
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle & { boxShadow?: string },
  editBtnText: {
    ...typography.button,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  wearAgainBtn: {
    flex: 1,
    backgroundColor: "#141412",
    borderRadius: radius.full,
    paddingVertical: 12,
    alignItems: "center",
    boxShadow: "0px 8px 20px rgba(20, 20, 18, 0.35)",
    shadowColor: "#141412",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  } as ViewStyle & { boxShadow?: string },
  wearAgainBtnText: {
    ...typography.button,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
