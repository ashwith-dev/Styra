import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ClothingItemBrief } from "@/lib/types";
import { Card, CachedImage } from "@/components/ui";
import { colors, spacing, typography } from "@/theme";

interface ClothingCardProps {
  item: ClothingItemBrief;
  onPress: () => void;
  onLongPress: () => void;
}

/** Extracts a readable label from item attributes. */
function getLabel(attrs: Record<string, unknown>): string {
  const color =
    typeof attrs.color === "object" && attrs.color !== null && "value" in attrs.color
      ? String((attrs.color as { value: unknown }).value)
      : "";
  const type =
    typeof attrs.type === "object" && attrs.type !== null && "value" in attrs.type
      ? String((attrs.type as { value: unknown }).value)
      : "item";
  return [color, type].filter(Boolean).join(" ");
}

function getBestImageUrl(item: ClothingItemBrief): string {
  return item.thumbnail_url || item.segmented_image_url || item.original_image_url;
}

/**
 * Wardrobe grid card.
 *
 * Composes the existing Card UI component (elevated variant, zero padding) as
 * the visual container, wrapping it in a TouchableOpacity to support both
 * onPress and onLongPress — which Card does not natively expose.
 */
export const ClothingCard = memo(function ClothingCard({
  item,
  onPress,
  onLongPress,
}: ClothingCardProps) {
  const attrs = item.attributes ?? {};
  const label = getLabel(attrs);
  const imageUrl = getBestImageUrl(item);

  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      accessibilityRole="imagebutton"
      accessibilityLabel={label || "Clothing item"}
      accessibilityHint="Double tap to view details, long press to delete"
      testID={`clothing-card-${item.id}`}
    >
      <Card variant="elevated" padding={0} style={styles.card}>
        <CachedImage
          uri={imageUrl}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={`${label} photo`}
        />
        <View style={styles.info}>
          <Text style={styles.label} numberOfLines={1}>
            {label || "—"}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  card: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 0.85,
    backgroundColor: colors.border,
  },
  info: {
    padding: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "500",
  },
});
