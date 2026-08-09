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
  sm: 38,
  md: 48,
  lg: 54,
};

const paddingMap: Record<ButtonSize, number> = {
  sm: spacing.md,
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
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#FFFFFF" : colors.textPrimary}
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
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  primary: {
    backgroundColor: "#141412",
    boxShadow: "0px 6px 16px rgba(20, 20, 18, 0.3)",
    shadowColor: "#141412",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
  outline: {
    backgroundColor: "#F7F5F0",
    borderWidth: 0,
    boxShadow: "-6px -6px 16px #FFFFFF, 6px 6px 16px rgba(185, 175, 158, 0.65)",
    shadowColor: "#000000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  } as ViewStyle & { boxShadow?: string },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    ...typography.button,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  labelLg: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
  labelPrimary: {
    color: "#FFFFFF",
  },
  labelOutline: {
    color: colors.textPrimary,
  },
  labelGhost: {
    color: colors.textPrimary,
  },
});
