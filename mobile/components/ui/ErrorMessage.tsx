import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight, spacing, borderRadius } from "../../lib/theme";
import { Button } from "./Button";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && <Button label="Try Again" onPress={onRetry} variant="outline" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  message: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.error,
    textAlign: "center",
    lineHeight: 20,
  },
});
