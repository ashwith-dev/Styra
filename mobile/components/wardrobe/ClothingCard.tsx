import { memo, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ClothingItemBrief } from "@/lib/types";
import { CachedImage } from "@/components/ui";
import { colors, spacing, typography } from "@/theme";

interface ClothingCardProps {
  item: ClothingItemBrief;
  onPress: () => void;
  onLongPress: () => void;
}

function getCategoryTag(attrs: Record<string, unknown>): string {
  const cat =
    typeof attrs.category === "object" && attrs.category !== null && "value" in attrs.category
      ? String((attrs.category as { value: unknown }).value)
      : typeof attrs.category === "string"
      ? attrs.category
      : "CLOTHING";

  const color =
    typeof attrs.color === "object" && attrs.color !== null && "value" in attrs.color
      ? String((attrs.color as { value: unknown }).value)
      : typeof attrs.color === "string"
      ? attrs.color
      : "";

  return [cat.toUpperCase(), color.toUpperCase()].filter(Boolean).join(" • ");
}

function getItemTitle(attrs: Record<string, unknown>): string {
  if (typeof attrs.name === "string" && attrs.name.trim()) return attrs.name.trim();

  const color =
    typeof attrs.color === "object" && attrs.color !== null && "value" in attrs.color
      ? String((attrs.color as { value: unknown }).value)
      : "";
  const type =
    typeof attrs.type === "object" && attrs.type !== null && "value" in attrs.type
      ? String((attrs.type as { value: unknown }).value)
      : typeof attrs.category === "object" && attrs.category !== null && "value" in attrs.category
      ? String((attrs.category as { value: unknown }).value)
      : "Garment";

  const title = [color, type].filter(Boolean).join(" ");
  return title ? title.charAt(0).toUpperCase() + title.slice(1) : "Clothing Item";
}

function getBestImageUrl(item: ClothingItemBrief): string {
  return item.thumbnail_url || item.segmented_image_url || item.original_image_url;
}

export const ClothingCard = memo(function ClothingCard({
  item,
  onPress,
  onLongPress,
}: ClothingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const attrs = item.attributes ?? {};
  const categoryTag = getCategoryTag(attrs);
  const title = getItemTitle(attrs);
  const imageUrl = getBestImageUrl(item);

  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.88}
      accessibilityRole="imagebutton"
      accessibilityLabel={title}
      testID={`clothing-card-${item.id}`}
    >
      <View style={styles.cardContainer}>
        {/* Image Container with Top-Right Favorite Button */}
        <View style={styles.imageWrapper}>
          <CachedImage
            uri={imageUrl}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={`${title} photo`}
          />

          <TouchableOpacity
            onPress={() => setIsFavorite((prev) => !prev)}
            style={styles.favoriteBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={14}
              color={isFavorite ? "#E53935" : "#1A1A1A"}
            />
          </TouchableOpacity>
        </View>

        {/* Info Labels */}
        <View style={styles.info}>
          <Text style={styles.categoryTag} numberOfLines={1}>
            {categoryTag}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.lg,
  },
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: 0.88,
    backgroundColor: "#F5F2EC",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favoriteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    padding: spacing.sm,
  },
  categoryTag: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
