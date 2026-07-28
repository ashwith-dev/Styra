import { forwardRef } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { colors, spacing, radius, typography } from "@/theme";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  testID?: string;
  style?: ViewStyle;
}

const heightMap: Record<ButtonSize, number> = {
  sm: 36,
  md: 48,
  lg: 56,
};

const paddingMap: Record<ButtonSize, number> = {
  sm: spacing.sm,
  md: spacing.lg,
  lg: spacing.xl,
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    label,
    onPress,
    disabled,
    loading,
    variant = "primary",
    size = "md",
    fullWidth,
    testID,
    style,
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      ref={ref}
      testID={testID}
      style={[
        styles.base,
        { height: heightMap[size], paddingHorizontal: paddingMap[size] },
        variant === "primary" && styles.primary,
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.surface : colors.accent}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            size === "lg" && styles.labelLg,
            variant === "primary" && styles.labelPrimary,
            variant === "outline" && styles.labelOutline,
            variant === "ghost" && styles.labelGhost,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  primary: {
    backgroundColor: colors.accent,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.button,
    color: colors.accent,
  },
  labelLg: {
    fontSize: 18,
    letterSpacing: 0.3,
  },
  labelPrimary: {
    color: colors.surface,
  },
  labelOutline: {
    color: colors.accent,
  },
  labelGhost: {
    color: colors.accent,
  },
});
