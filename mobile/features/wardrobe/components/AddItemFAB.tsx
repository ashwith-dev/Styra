import { StyleSheet, Text, TouchableOpacity, type ViewStyle } from "react-native";
import { radius, typography } from "@/theme";

interface AddItemFABProps {
  onPress: () => void;
  testID?: string;
}

/**
 * Floating Action Button to add a new clothing item.
 * Positioned absolutely in the bottom-right corner with Neumorphic elevated depth.
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
    backgroundColor: "#141412",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 8px 20px rgba(20, 20, 18, 0.35)",
    shadowColor: "#141412",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 99,
  } as ViewStyle & { boxShadow?: string },
  icon: {
    ...typography.h2,
    color: "#FFFFFF",
    lineHeight: 32,
    marginTop: -2,
  },
});
