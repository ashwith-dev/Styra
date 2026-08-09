import {
  View,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { colors, spacing } from "@/theme";

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
        activeOpacity: 0.88,
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
    backgroundColor: "#F7F5F0",
    borderRadius: 22,
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
  elevated: {
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
  } as ViewStyle & { boxShadow?: string },
  outlined: {
    boxShadow: "-6px -6px 16px #FFFFFF, 6px 6px 16px rgba(185, 175, 158, 0.65)",
    borderWidth: 0,
  } as ViewStyle & { boxShadow?: string },
  flat: {
    boxShadow: "none",
    shadowOpacity: 0,
    elevation: 0,
  } as ViewStyle & { boxShadow?: string },
});
