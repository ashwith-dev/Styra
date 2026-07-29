import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

interface AuthFooterLinkProps {
  /** Static prefix text, e.g. "Don't have an account?" */
  prefix: string;
  /** Tappable link label, e.g. "Sign Up" */
  linkLabel: string;
  onPress: () => void;
  testID?: string;
}

/**
 * Footer navigation text used at the bottom of auth screens.
 * Example: "Don't have an account?  Sign Up"
 *
 * The link portion is rendered in the brand accent colour.
 */
export function AuthFooterLink({
  prefix,
  linkLabel,
  onPress,
  testID,
}: AuthFooterLinkProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.prefix}>{prefix} </Text>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="link"
        accessibilityLabel={linkLabel}
      >
        <Text style={styles.link}>{linkLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  prefix: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  link: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: "600",
  },
});
