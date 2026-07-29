import { memo } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

      {/* Outfit Title & Saved Timestamp */}
      <View style={styles.infoSection}>
        <Text style={styles.outfitTitle}>{look.name || "Custom Look"}</Text>
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
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
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
    backgroundColor: "#F4F1EA",
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  tagText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#1A1A1A",
  },
  infoSection: {
    marginBottom: spacing.md,
  },
  outfitTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
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
    borderWidth: 1,
    borderColor: "#E0DDD5",
    borderRadius: radius.full,
    paddingVertical: 12,
    alignItems: "center",
  },
  editBtnText: {
    ...typography.button,
    fontSize: 14,
    color: "#1A1A1A",
  },
  wearAgainBtn: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: radius.full,
    paddingVertical: 12,
    alignItems: "center",
  },
  wearAgainBtnText: {
    ...typography.button,
    fontSize: 14,
    color: colors.surface,
  },
});
