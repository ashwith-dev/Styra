import {
  View,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { colors, spacing, radius, shadows } from "@/theme";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "elevated" | "outlined" | "flat";
  padding?: number | keyof typeof spacing;
  testID?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

function resolvePadding(value: number | keyof typeof spacing): number {
  if (typeof value === "number") return value;
  return spacing[value];
}

export function Card({
  children,
  onPress,
  variant = "elevated",
  padding = "md",
  testID,
  accessibilityLabel,
  style,
}: CardProps) {
  const pad = resolvePadding(padding);
  const Container = onPress ? TouchableOpacity : View;

  const containerProps = onPress
    ? {
        onPress,
        activeOpacity: 0.9,
        accessibilityRole: "button" as const,
        accessibilityLabel: accessibilityLabel ?? "Card",
      }
    : {};

  return (
    <Container
      testID={testID}
      style={[
        styles.base,
        { padding: pad },
        variant === "elevated" && styles.elevated,
        variant === "outlined" && styles.outlined,
        variant === "flat" && styles.flat,
        style,
      ]}
      {...containerProps}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  elevated: {
    ...shadows.small,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {},
});
