import { Image, StyleSheet, View } from "react-native";
import type { ClothingItemBrief } from "@/lib/types";
import type { SavedLookItem } from "../types/looks";

type CollageItem = SavedLookItem | ClothingItemBrief;

interface OutfitCollagePreviewProps {
  items: CollageItem[];
}

const DEFAULT_GARMENTS = [
  "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop",
];

export function OutfitCollagePreview({ items }: OutfitCollagePreviewProps) {
  const displayItems = items.length > 0 ? items.slice(0, 4) : [];

  const getItemUrl = (item?: CollageItem, fallbackIdx: number = 0): string => {
    if (!item) return DEFAULT_GARMENTS[fallbackIdx % DEFAULT_GARMENTS.length];
    const orig = "original_image_url" in item ? item.original_image_url : null;
    return item.thumbnail_url || item.segmented_image_url || orig || DEFAULT_GARMENTS[fallbackIdx % DEFAULT_GARMENTS.length];
  };

  // 1 or 2 items layout
  if (displayItems.length <= 2) {
    return (
      <View style={styles.collageContainer}>
        <View style={styles.row}>
          <Image
            source={{ uri: getItemUrl(displayItems[0], 0) }}
            style={styles.halfImage}
            resizeMode="contain"
          />
          {displayItems.length > 1 && (
            <Image
              source={{ uri: getItemUrl(displayItems[1], 1) }}
              style={styles.halfImage}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    );
  }

  // 3 items layout: 1 large left, 2 stacked right
  if (displayItems.length === 3) {
    return (
      <View style={styles.collageContainer}>
        <View style={styles.row}>
          <View style={styles.leftCol}>
            <Image
              source={{ uri: getItemUrl(displayItems[0], 0) }}
              style={styles.fullSize}
              resizeMode="contain"
            />
          </View>
          <View style={styles.rightCol}>
            <Image
              source={{ uri: getItemUrl(displayItems[1], 1) }}
              style={styles.halfHeight}
              resizeMode="contain"
            />
            <Image
              source={{ uri: getItemUrl(displayItems[2], 2) }}
              style={styles.halfHeight}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    );
  }

  // 4 items layout: 2x2 grid
  return (
    <View style={styles.collageContainer}>
      <View style={styles.grid2x2}>
        <View style={styles.gridRow}>
          <Image
            source={{ uri: getItemUrl(displayItems[0], 0) }}
            style={styles.gridCell}
            resizeMode="contain"
          />
          <Image
            source={{ uri: getItemUrl(displayItems[1], 1) }}
            style={styles.gridCell}
            resizeMode="contain"
          />
        </View>
        <View style={styles.gridRow}>
          <Image
            source={{ uri: getItemUrl(displayItems[2], 2) }}
            style={styles.gridCell}
            resizeMode="contain"
          />
          <Image
            source={{ uri: getItemUrl(displayItems[3], 3) }}
            style={styles.gridCell}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collageContainer: {
    width: "100%",
    height: 260,
    backgroundColor: "#FDFCF9",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  halfImage: {
    flex: 1,
    height: "100%",
  },
  leftCol: {
    flex: 1.1,
    height: "100%",
  },
  rightCol: {
    flex: 1,
    height: "100%",
    gap: 8,
  },
  fullSize: {
    width: "100%",
    height: "100%",
  },
  halfHeight: {
    width: "100%",
    height: "48%",
  },
  grid2x2: {
    flex: 1,
    gap: 8,
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  gridCell: {
    flex: 1,
    height: "100%",
  },
});
