import { memo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import type { ClothingItemBrief } from "../../lib/types";
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from "../../lib/theme";

interface ClothingCardProps {
  item: ClothingItemBrief;
  onPress: () => void;
  onLongPress: () => void;
}

/** Returns a label like "navy blue t-shirt" from the attributes. */
function getLabel(attrs: Record<string, unknown>): string {
  const color = (attrs.color as any)?.value || "";
  const type = (attrs.type as any)?.value || "item";
  return [color, type].filter(Boolean).join(" ");
}

export const ClothingCard = memo(function ClothingCard({
  item,
  onPress,
  onLongPress,
}: ClothingCardProps) {
  const attrs = item.attributes || {};
  const imageUrl = item.thumbnail_url || item.segmented_image_url;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      accessibilityLabel={`${getLabel(attrs)}, double tap to view`}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.label} numberOfLines={1}>
          {getLabel(attrs)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    ...shadows.sm,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surface,
  },
  info: {
    padding: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
});
