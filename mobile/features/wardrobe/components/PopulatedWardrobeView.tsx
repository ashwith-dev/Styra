import { useMemo } from "react";
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ClothingItemBrief } from "@/lib/types";
import { colors, radius, spacing, typography } from "@/theme";
import { ClothingCard } from "@/components/wardrobe/ClothingCard";

interface PopulatedWardrobeViewProps {
  items: ClothingItemBrief[];
  allItems: ClothingItemBrief[];
  loading: boolean;
  onRefresh: () => void;
  onPressItem: (id: string) => void;
  onLongPressItem: (id: string) => void;
}

const DEFAULT_CATEGORY_IMAGES = {
  tops: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop",
  bottoms: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop",
  outerwear: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop",
  shoes: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
  accessories: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop",
  other: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop",
};

export function PopulatedWardrobeView({
  items,
  allItems,
  loading,
  onRefresh,
  onPressItem,
  onLongPressItem,
}: PopulatedWardrobeViewProps) {
  // ── Dynamic Category Counts Calculation ──
  const categoryStats = useMemo(() => {
    let tops = 0;
    let bottoms = 0;
    let outerwear = 0;
    let shoes = 0;
    let accessories = 0;
    let other = 0;

    let topImg: string | null = null;
    let bottomImg: string | null = null;
    let outerwearImg: string | null = null;
    let shoesImg: string | null = null;
    let accessoriesImg: string | null = null;
    let otherImg: string | null = null;

    for (const item of allItems) {
      const rawCat = (item.attributes as Record<string, unknown>)?.category;
      const catVal = (
        typeof rawCat === "object" && rawCat !== null && "value" in rawCat
          ? String((rawCat as { value: unknown }).value)
          : typeof rawCat === "string"
          ? rawCat
          : ""
      ).toLowerCase();

      const img = item.thumbnail_url || item.segmented_image_url || item.original_image_url;

      if (catVal.includes("top") || catVal.includes("shirt") || catVal.includes("blouse") || catVal.includes("t-shirt") || catVal.includes("sweater")) {
        tops++;
        if (!topImg && img) topImg = img;
      } else if (catVal.includes("bottom") || catVal.includes("pant") || catVal.includes("jean") || catVal.includes("short") || catVal.includes("skirt") || catVal.includes("trouser")) {
        bottoms++;
        if (!bottomImg && img) bottomImg = img;
      } else if (catVal.includes("outerwear") || catVal.includes("coat") || catVal.includes("jacket") || catVal.includes("blazer")) {
        outerwear++;
        if (!outerwearImg && img) outerwearImg = img;
      } else if (catVal.includes("shoe") || catVal.includes("footwear") || catVal.includes("boot") || catVal.includes("sneaker") || catVal.includes("loafer")) {
        shoes++;
        if (!shoesImg && img) shoesImg = img;
      } else if (catVal.includes("accessori") || catVal.includes("bag") || catVal.includes("belt") || catVal.includes("hat") || catVal.includes("sunglass") || catVal.includes("watch")) {
        accessories++;
        if (!accessoriesImg && img) accessoriesImg = img;
      } else {
        other++;
        if (!otherImg && img) otherImg = img;
      }
    }

    return {
      tops,
      bottoms,
      outerwear,
      shoes,
      accessories,
      other,
      topImg: topImg || DEFAULT_CATEGORY_IMAGES.tops,
      bottomImg: bottomImg || DEFAULT_CATEGORY_IMAGES.bottoms,
      outerwearImg: outerwearImg || DEFAULT_CATEGORY_IMAGES.outerwear,
      shoesImg: shoesImg || DEFAULT_CATEGORY_IMAGES.shoes,
      accessoriesImg: accessoriesImg || DEFAULT_CATEGORY_IMAGES.accessories,
      otherImg: otherImg || DEFAULT_CATEGORY_IMAGES.other,
    };
  }, [allItems]);

  // ── Header Content above the 2-column item grid ──
  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.headerContainer}>
        {/* Title Header */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Your Wardrobe</Text>
          <Text style={styles.mainSubtitle}>
            Organised beautifully for every occasion
          </Text>
        </View>

        {/* Top Hero Featured Category Card (Tops) */}
        <View style={styles.featuredHeroCard}>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>
              {categoryStats.tops} {categoryStats.tops === 1 ? "Item" : "Items"}
            </Text>
          </View>
          <Text style={styles.featuredTitle}>Tops</Text>
          <Image
            source={{ uri: categoryStats.topImg }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        </View>

        {/* 2-Column Category Grid Cards */}
        <View style={styles.categoriesGrid}>
          {/* Row 1: Bottom Wear & Outerwear */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryCard}>
              <Text style={styles.categoryName}>Bottom Wear</Text>
              <Text style={styles.categoryCount}>
                {categoryStats.bottoms} {categoryStats.bottoms === 1 ? "Item" : "Items"}
              </Text>
              <Image
                source={{ uri: categoryStats.bottomImg }}
                style={styles.categoryThumb}
                resizeMode="cover"
              />
            </View>

            <View style={styles.categoryCard}>
              <Text style={styles.categoryName}>Outerwear</Text>
              <Text style={styles.categoryCount}>
                {categoryStats.outerwear} {categoryStats.outerwear === 1 ? "Item" : "Items"}
              </Text>
              <Image
                source={{ uri: categoryStats.outerwearImg }}
                style={styles.categoryThumb}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Row 2: Shoes & Accessories */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryCard}>
              <Text style={styles.categoryName}>Shoes</Text>
              <Text style={styles.categoryCount}>
                {categoryStats.shoes} {categoryStats.shoes === 1 ? "Item" : "Items"}
              </Text>
              <Image
                source={{ uri: categoryStats.shoesImg }}
                style={styles.categoryThumb}
                resizeMode="cover"
              />
            </View>

            <View style={styles.categoryCard}>
              <Text style={styles.categoryName}>Accessories</Text>
              <Text style={styles.categoryCount}>
                {categoryStats.accessories} {categoryStats.accessories === 1 ? "Item" : "Items"}
              </Text>
              <Image
                source={{ uri: categoryStats.accessoriesImg }}
                style={styles.categoryThumb}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Optional Row 3: Other / Extras */}
          {categoryStats.other > 0 && (
            <View style={styles.categoryRow}>
              <View style={styles.categoryCard}>
                <Text style={styles.categoryName}>Other</Text>
                <Text style={styles.categoryCount}>
                  {categoryStats.other} {categoryStats.other === 1 ? "Item" : "Items"}
                </Text>
                <Image
                  source={{ uri: categoryStats.otherImg }}
                  style={styles.categoryThumb}
                  resizeMode="cover"
                />
              </View>
            </View>
          )}
        </View>

        {/* All Clothes Section Title */}
        <Text style={styles.allClothesTitle}>All Clothes</Text>
      </View>
    ),
    [categoryStats],
  );

  return (
    <FlatList
      data={items}
      numColumns={2}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={styles.flatListContent}
      columnWrapperStyle={styles.columnWrapper}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          tintColor={colors.textSecondary}
        />
      }
      renderItem={({ item }) => (
        <ClothingCard
          item={item}
          onPress={() => onPressItem(item.id)}
          onLongPress={() => onLongPressItem(item.id)}
        />
      )}
      removeClippedSubviews
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  flatListContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: 120,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  headerContainer: {
    marginBottom: spacing.md,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  mainTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  mainSubtitle: {
    ...typography.caption,
    fontSize: 14,
    color: colors.textSecondary,
  },
  featuredHeroCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  featuredBadge: {
    backgroundColor: "#F4F1EA",
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    alignSelf: "flex-start",
    marginBottom: spacing.xs,
  },
  featuredBadgeText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  featuredTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  featuredImage: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    backgroundColor: "#F5F2EC",
  },
  categoriesGrid: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  categoryRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    height: 120,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryName: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  categoryCount: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryThumb: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F5F2EC",
  },
  allClothesTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});
