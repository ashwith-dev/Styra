import {
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { colors } from "@/theme";

type IconButtonVariant = "primary" | "outline" | "ghost";
type IconButtonSize = "sm" | "md" | "lg";

const sizeMap: Record<IconButtonSize, number> = {
  sm: 36,
  md: 44,
  lg: 52,
};

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  accessibilityLabel: string;
  testID?: string;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  variant = "ghost",
  size = "md",
  disabled,
  accessibilityLabel,
  testID,
  style,
}: IconButtonProps) {
  const dimension = sizeMap[size];

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.base,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
        variant === "primary" && styles.primary,
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
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
});
