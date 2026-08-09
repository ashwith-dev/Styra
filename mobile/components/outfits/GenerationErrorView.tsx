/**
 * Error states for outfit generation.
 *
 * Displays context-appropriate empty/error states depending on the
 * error code returned by the generation hook.
 */

import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/theme";
import { Button } from "@/components/ui/Button";
import type { GenerationError } from "@/hooks/useOutfitGeneration";

interface GenerationErrorViewProps {
  error: GenerationError;
  onRetry?: () => void;
  onBack: () => void;
}

const ERROR_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; title: string }> = {
  WARDROBE_INSUFFICIENT: {
    icon: "shirt-outline",
    title: "Not Enough Items",
  },
  NETWORK_ERROR: {
    icon: "cloud-offline-outline",
    title: "Connection Issue",
  },
  INVALID_REQUEST: {
    icon: "alert-circle-outline",
    title: "Invalid Selection",
  },
  GENERATION_FAILED: {
    icon: "warning-outline",
    title: "Generation Failed",
  },
};

const FALLBACK_CONFIG = {
  icon: "warning-outline" as const,
  title: "Something Went Wrong",
};

export function GenerationErrorView({
  error,
  onRetry,
  onBack,
}: GenerationErrorViewProps) {
  const config = ERROR_CONFIG[error.code] || FALLBACK_CONFIG;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={config.icon} size={48} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.message}>{error.message}</Text>
      <View style={styles.actions}>
        {error.retry && onRetry && (
          <Button label="Try Again" onPress={onRetry} variant="primary" size="md" />
        )}
        <View style={{ height: spacing.sm }} />
        <Button label="Back" onPress={onBack} variant="outline" size="md" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  actions: {
    width: "100%",
    maxWidth: 280,
  },
});
