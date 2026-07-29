import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { colors, spacing, radius } from "@/theme";

type BadgeVariant = "default" | "success" | "warning" | "error";
type BadgeSize = "sm" | "md";

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.border, text: colors.textPrimary },
  success: { bg: colors.success, text: colors.surface },
  warning: { bg: colors.warning, text: colors.surface },
  error: { bg: colors.error, text: colors.surface },
};

const sizeStyles: Record<BadgeSize, { py: number; px: number; fontSize: number }> = {
  sm: { py: 2, px: spacing.xs, fontSize: 11 },
  md: { py: spacing.xxs, px: spacing.sm, fontSize: 12 },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  testID?: string;
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = "default",
  size = "sm",
  testID,
  style,
}: BadgeProps) {
  const colorset = variantColors[variant];
  const dims = sizeStyles[size];

  return (
    <View
      testID={testID}
      style={[
        styles.badge,
        {
          backgroundColor: colorset.bg,
          paddingVertical: dims.py,
          paddingHorizontal: dims.px,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: colorset.text, fontSize: dims.fontSize }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
  },
  label: {
    fontFamily: "Inter",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
