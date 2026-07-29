import { View, Text, StyleSheet } from "react-native";
import { Input } from "@/components/ui/Input";
import { colors, radius, spacing, typography } from "@/theme";

interface AttributeFieldProps {
  label: string;
  value: string;
  confidence?: number;
  onChangeText: (text: string) => void;
  editable?: boolean;
  error?: string;
  multiline?: boolean;
  testID?: string;
}

export function AttributeField({
  label,
  value,
  confidence,
  onChangeText,
  editable = true,
  error,
  multiline,
  testID,
}: AttributeFieldProps) {
  const showConfidence = confidence != null && confidence > 0;
  const confidencePercent = showConfidence ? Math.round(confidence * 100) : 0;

  const confidenceLabel =
    confidencePercent >= 90 ? "High" : confidencePercent >= 60 ? "Medium" : "Low";
  const confidenceColor =
    confidencePercent >= 90
      ? colors.success
      : confidencePercent >= 60
      ? colors.warning
      : colors.error;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {showConfidence && (
          <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + "20" }]}>
            <Text style={[styles.confidenceText, { color: confidenceColor }]}>
              {confidenceLabel} {confidencePercent}%
            </Text>
          </View>
        )}
      </View>

      {editable ? (
        <Input
          value={value}
          onChangeText={onChangeText}
          error={error}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          placeholder={`Enter ${label.toLowerCase()}...`}
          testID={testID}
        />
      ) : (
        <View style={styles.readonly}>
          <Text style={styles.readonlyText}>{value || "—"}</Text>
        </View>
      )}

      {showConfidence && (
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${confidencePercent}%`, backgroundColor: confidenceColor },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  confidenceText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  readonly: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  readonlyText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  barTrack: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    marginTop: spacing.xs,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: radius.full,
  },
});
