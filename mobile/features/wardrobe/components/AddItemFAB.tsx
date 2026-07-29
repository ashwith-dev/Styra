import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, radius, shadows, typography } from "@/theme";

interface AddItemFABProps {
  onPress: () => void;
  testID?: string;
}

/**
 * Floating Action Button to add a new clothing item.
 * Positioned absolutely in the bottom-right corner.
 * Parent screen must have `position: "relative"` on its container.
 */
export function AddItemFAB({ onPress, testID }: AddItemFABProps) {
  return (
    <TouchableOpacity
      testID={testID ?? "add-item-fab"}
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Add clothing item"
    >
      <Text style={styles.icon}>＋</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.large,
  },
  icon: {
    ...typography.h2,
    color: colors.surface,
    lineHeight: 32,
    marginTop: -2,
  },
});
