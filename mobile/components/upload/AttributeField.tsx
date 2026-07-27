import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight, borderRadius, spacing } from "../../lib/theme";

interface AttributeFieldProps {
  label: string;
  value: string;
  confidence: number;
  onChangeText: (text: string) => void;
  editable?: boolean;
  error?: string;
}

export function AttributeField({
  label,
  value,
  confidence,
  onChangeText,
  editable = true,
  error,
}: AttributeFieldProps) {
  const [focused, setFocused] = useState(false);

  const confidenceLabel = confidence >= 0.9 ? "High" : confidence >= 0.6 ? "Medium" : "Low";
  const confidenceColor = confidence >= 0.9 ? "#22C55E" : confidence >= 0.6 ? "#F59E0B" : "#EF4444";

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + "20" }]}>
          <Text style={[styles.confidenceText, { color: confidenceColor }]}>
            {confidenceLabel} {Math.round(confidence * 100)}%
          </Text>
        </View>
      </View>

      {editable ? (
        <TextInput
          style={[styles.input, focused && styles.inputFocused, error && styles.inputError]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.textTertiary}
        />
      ) : (
        <View style={styles.readonly}>
          <Text style={styles.readonlyText}>{value || "—"}</Text>
        </View>
      )}

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.round(confidence * 100)}%`, backgroundColor: confidenceColor }]} />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textTransform: "capitalize",
  },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  confidenceText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    backgroundColor: colors.background,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  readonly: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  readonlyText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  barTrack: {
    height: 3,
    backgroundColor: colors.surface,
    borderRadius: 2,
    marginTop: spacing.xs,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
