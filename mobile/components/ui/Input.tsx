import { forwardRef } from "react";
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { colors, spacing, radius, typography } from "@/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, testID, style, ...rest },
  ref,
) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={ref}
        testID={testID}
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        accessibilityLabel={label}
        {...rest}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    ...typography.caption,
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xxs,
  },
  hint: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
});
