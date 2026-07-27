import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight, spacing, borderRadius } from "../../lib/theme";
import type { AttributeConfidence } from "../../lib/types";

interface AttributeTagsProps {
  label: string;
  items: AttributeConfidence[];
  emptyLabel?: string;
}

export function AttributeTags({ label, items, emptyLabel = "Not detected" }: AttributeTagsProps) {
  if (!items || items.length === 0) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.empty}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.tags}>
        {items.map((item, idx) => {
          const confidenceLabel =
            (item as any).confidence >= 0.9 ? "High"
            : (item as any).confidence >= 0.6 ? "Medium"
            : "Low";
          const color =
            (item as any).confidence >= 0.9 ? "#22C55E"
            : (item as any).confidence >= 0.6 ? "#F59E0B"
            : "#EF4444";

          return (
            <View key={idx} style={[styles.tag, { borderColor: color + "40" }]}>
              <Text style={styles.tagText}>{String(item.value)}</Text>
              <Text style={[styles.tagConfidence, { color }]}>({confidenceLabel})</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    textTransform: "capitalize",
  },
  empty: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    fontStyle: "italic",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  tagText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  tagConfidence: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
  },
});
