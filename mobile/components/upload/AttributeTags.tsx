import { View, Text, StyleSheet } from "react-native";
import { Chip } from "@/components/ui/Chip";
import { colors, spacing, typography } from "@/theme";
import type { AttributeConfidence } from "@/lib/types";

interface AttributeTagsProps {
  label: string;
  items: AttributeConfidence[] | string[];
  emptyLabel?: string;
  selectableOptions?: string[];
  onToggleTag?: (tag: string) => void;
}

export function AttributeTags({
  label,
  items,
  emptyLabel = "Not detected",
  selectableOptions,
  onToggleTag,
}: AttributeTagsProps) {
  // Normalize string array or AttributeConfidence array
  const activeTags = new Set(
    items.map((item) =>
      typeof item === "object" && item !== null && "value" in item
        ? String(item.value)
        : String(item),
    ),
  );

  const displayTags = selectableOptions || Array.from(activeTags);

  if (displayTags.length === 0) {
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
        {displayTags.map((tag) => {
          const isSelected = activeTags.has(tag);
          return (
            <Chip
              key={tag}
              label={tag}
              selected={isSelected}
              onPress={onToggleTag ? () => onToggleTag(tag) : undefined}
            />
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
    ...typography.caption,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textTransform: "capitalize",
  },
  empty: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
});
