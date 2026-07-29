import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

/**
 * Renders the "OR CONTINUE WITH" section divider
 * used between primary CTA and social sign-in buttons.
 */
export function AuthDivider() {
  return (
    <View style={styles.row} accessibilityRole="none">
      <View style={styles.line} />
      <Text style={styles.label}>OR CONTINUE WITH</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
