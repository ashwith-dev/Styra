import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { colors, spacing, typography } from "@/theme";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
  style?: ViewStyle;
}

export function EmptyState({
  icon = "\u{1F484}",
  title,
  description,
  actionLabel,
  onAction,
  testID,
  style,
}: EmptyStateProps) {
  return (
    <View testID={testID} style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="outline" style={styles.action} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.huge,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  action: {
    marginTop: spacing.sm,
  },
});
