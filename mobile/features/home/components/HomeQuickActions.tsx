/**
 * HomeQuickActions.tsx
 *
 * Premium two-button action row for the home screen.
 * Generate Outfit (dark full-width pill) + Add Clothing (secondary pill).
 */

import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "@/theme";
import type { HomeQuickActionsProps } from "../types";

export function HomeQuickActions({
  onAddClothing,
  onGenerateOutfit,
  hasOutfitForSelectedDate = false,
}: HomeQuickActionsProps) {
  return (
    <View style={styles.container}>
      {/* Primary: Generate Outfit OR Outfit Generated */}
      <TouchableOpacity
        style={styles.generateBtn}
        onPress={hasOutfitForSelectedDate ? undefined : onGenerateOutfit}
        disabled={hasOutfitForSelectedDate}
        activeOpacity={hasOutfitForSelectedDate ? 1 : 0.85}
        testID="home-generate-outfit"
      >
        <Ionicons
          name={hasOutfitForSelectedDate ? "checkmark-circle" : "sparkles"}
          size={16}
          color={colors.surface}
        />
        <Text style={styles.generateText}>
          {hasOutfitForSelectedDate ? "Outfit Generated" : "Generate Outfit"}
        </Text>
      </TouchableOpacity>

      {/* Secondary: Add Clothing — outlined pill, same row */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={onAddClothing}
        activeOpacity={0.8}
        testID="home-quick-add"
      >
        <Ionicons name="add" size={17} color={colors.textPrimary} />
        <Text style={styles.addText}>Add Clothing</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  generateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    paddingVertical: 14,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  generateText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.surface,
    letterSpacing: 0.2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
  },
  addText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },
});
