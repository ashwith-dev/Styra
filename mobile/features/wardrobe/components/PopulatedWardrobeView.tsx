import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  onAddClothing: () => void;
}

const DEFAULT_CATEGORY_IMAGES = {
  tops: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop",
  bottoms: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop",
  outerwear: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop",
  shoes: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
  accessories: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop",
  other: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop",
};

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "tops", label: "Tops" },
  { key: "bottoms", label: "Bottom Wear" },
  { key: "outerwear", label: "Outerwear" },
  { key: "shoes", label: "Shoes" },
  { key: "accessories", label: "Accessories" },
  { key: "other", label: "Other" },
];

function matchesCategoryKey(item: ClothingItemBrief, categoryKey: string): boolean {
  if (!categoryKey || categoryKey === "all") return true;

  const rawCat = (item.attributes as Record<string, unknown>)?.category;
  const catVal = (
    typeof rawCat === "object" && rawCat !== null && "value" in rawCat
      ? String((rawCat as { value: unknown }).value)
      : typeof rawCat === "string"
      ? rawCat
      : ""
  ).toLowerCase();

  if (categoryKey === "tops") {
    return (
      catVal.includes("top") ||
      catVal.includes("shirt") ||
      catVal.includes("blouse") ||
      catVal.includes("t-shirt") ||
      catVal.includes("sweater")
    );
  }
  if (categoryKey === "bottoms") {
    return (
      catVal.includes("bottom") ||
      catVal.includes("pant") ||
      catVal.includes("jean") ||
      catVal.includes("short") ||
      catVal.includes("skirt") ||
      catVal.includes("trouser")
    );
  }
  if (categoryKey === "outerwear") {
    return (
      catVal.includes("outerwear") ||
      catVal.includes("coat") ||
      catVal.includes("jacket") ||
      catVal.includes("blazer")
    );
  }
  if (categoryKey === "shoes") {
    return (
      catVal.includes("shoe") ||
      catVal.includes("footwear") ||
      catVal.includes("boot") ||
      catVal.includes("sneaker") ||
      catVal.includes("loafer")
    );
  }
  if (categoryKey === "accessories") {
    return (
      catVal.includes("accessori") ||
      catVal.includes("bag") ||
      catVal.includes("belt") ||
      catVal.includes("hat") ||
      catVal.includes("sunglass") ||
      catVal.includes("watch")
    );
  }
  if (categoryKey === "other") {
    return (
      !matchesCategoryKey(item, "tops") &&
      !matchesCategoryKey(item, "bottoms") &&
      !matchesCategoryKey(item, "outerwear") &&
      !matchesCategoryKey(item, "shoes") &&
      !matchesCategoryKey(item, "accessories")
    );
  }

  return catVal === categoryKey;
}

export function PopulatedWardrobeView({
  items,
  allItems,
  loading,
  onRefresh,
  onPressItem,
  onLongPressItem,
  onAddClothing,
}: PopulatedWardrobeViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
      const img = item.thumbnail_url || item.segmented_image_url || item.original_image_url;

      if (matchesCategoryKey(item, "tops")) {
        tops++;
        if (!topImg && img) topImg = img;
      } else if (matchesCategoryKey(item, "bottoms")) {
        bottoms++;
        if (!bottomImg && img) bottomImg = img;
      } else if (matchesCategoryKey(item, "outerwear")) {
        outerwear++;
        if (!outerwearImg && img) outerwearImg = img;
      } else if (matchesCategoryKey(item, "shoes")) {
        shoes++;
        if (!shoesImg && img) shoesImg = img;
      } else if (matchesCategoryKey(item, "accessories")) {
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

  // Filter items by category
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => matchesCategoryKey(item, selectedCategory));
  }, [allItems, selectedCategory]);

  const selectedCategoryLabel = useMemo(() => {
    return CATEGORIES.find((c) => c.key === selectedCategory)?.label || "Items";
  }, [selectedCategory]);

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
        <TouchableOpacity
          style={[
            styles.featuredHeroCard,
            selectedCategory === "tops" && styles.selectedCategoryCard,
          ]}
          onPress={() => setSelectedCategory(selectedCategory === "tops" ? "all" : "tops")}
          activeOpacity={0.85}
        >
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
        </TouchableOpacity>

        {/* 2-Column Category Grid Cards */}
        <View style={styles.categoriesGrid}>
          {/* Row 1: Bottom Wear & Outerwear */}
          <View style={styles.categoryRow}>
            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === "bottoms" && styles.selectedCategoryCard,
              ]}
              onPress={() => setSelectedCategory(selectedCategory === "bottoms" ? "all" : "bottoms")}
              activeOpacity={0.85}
            >
              <Text style={styles.categoryName}>Bottom Wear</Text>
              <Text style={styles.categoryCount}>
                {categoryStats.bottoms} {categoryStats.bottoms === 1 ? "Item" : "Items"}
              </Text>
              <Image
                source={{ uri: categoryStats.bottomImg }}
                style={styles.categoryThumb}
                resizeMode="cover"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === "outerwear" && styles.selectedCategoryCard,
              ]}
              onPress={() => setSelectedCategory(selectedCategory === "outerwear" ? "all" : "outerwear")}
              activeOpacity={0.85}
            >
              <Text style={styles.categoryName}>Outerwear</Text>
              <Text style={styles.categoryCount}>
                {categoryStats.outerwear} {categoryStats.outerwear === 1 ? "Item" : "Items"}
              </Text>
              <Image
                source={{ uri: categoryStats.outerwearImg }}
                style={styles.categoryThumb}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>

          {/* Row 2: Shoes & Accessories */}
          <View style={styles.categoryRow}>
            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === "shoes" && styles.selectedCategoryCard,
              ]}
              onPress={() => setSelectedCategory(selectedCategory === "shoes" ? "all" : "shoes")}
              activeOpacity={0.85}
            >
              <Text style={styles.categoryName}>Shoes</Text>
              <Text style={styles.categoryCount}>
                {categoryStats.shoes} {categoryStats.shoes === 1 ? "Item" : "Items"}
              </Text>
              <Image
                source={{ uri: categoryStats.shoesImg }}
                style={styles.categoryThumb}
                resizeMode="cover"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === "accessories" && styles.selectedCategoryCard,
              ]}
              onPress={() => setSelectedCategory(selectedCategory === "accessories" ? "all" : "accessories")}
              activeOpacity={0.85}
            >
              <Text style={styles.categoryName}>Accessories</Text>
              <Text style={styles.categoryCount}>
                {categoryStats.accessories} {categoryStats.accessories === 1 ? "Item" : "Items"}
              </Text>
              <Image
                source={{ uri: categoryStats.accessoriesImg }}
                style={styles.categoryThumb}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>

          {/* Optional Row 3: Other / Extras */}
          {categoryStats.other > 0 && (
            <View style={styles.categoryRow}>
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  selectedCategory === "other" && styles.selectedCategoryCard,
                ]}
                onPress={() => setSelectedCategory(selectedCategory === "other" ? "all" : "other")}
                activeOpacity={0.85}
              >
                <Text style={styles.categoryName}>Other</Text>
                <Text style={styles.categoryCount}>
                  {categoryStats.other} {categoryStats.other === 1 ? "Item" : "Items"}
                </Text>
                <Image
                  source={{ uri: categoryStats.otherImg }}
                  style={styles.categoryThumb}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Filter Chips Horizontal Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* All Clothes Section Title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.allClothesTitle}>
            {selectedCategory === "all" ? "All Clothes" : selectedCategoryLabel}
          </Text>
          {selectedCategory !== "all" && (
            <TouchableOpacity onPress={() => setSelectedCategory("all")}>
              <Text style={styles.clearFilterText}>Show All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    ),
    [categoryStats, selectedCategory, selectedCategoryLabel],
  );

  // ── List Empty Component for Specific Category ──
  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyCategoryContainer}>
        <View style={styles.emptyCategoryIconWrapper}>
          <Ionicons name="shirt-outline" size={36} color={colors.accent} />
        </View>
        <Text style={styles.emptyCategoryTitle}>
          No {selectedCategoryLabel} Added Yet
        </Text>
        <Text style={styles.emptyCategorySubtitle}>
          Upload your first {selectedCategoryLabel.toLowerCase()} item to build your STYRA wardrobe.
        </Text>
        <TouchableOpacity
          style={styles.addCategoryBtn}
          onPress={onAddClothing}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.addCategoryBtnText}>
            Add {selectedCategoryLabel} Item
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [selectedCategoryLabel, onAddClothing],
  );

  return (
    <FlatList
      data={filteredItems}
      numColumns={2}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={styles.flatListContent}
      columnWrapperStyle={filteredItems.length > 0 ? styles.columnWrapper : undefined}
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
    paddingBottom: 140,
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
    borderWidth: 1.5,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  selectedCategoryCard: {
    borderColor: colors.accent,
    backgroundColor: "#FDFBF7",
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
    marginBottom: spacing.lg,
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
    borderWidth: 1.5,
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
  filterScroll: {
    marginBottom: spacing.lg,
  },
  filterScrollContent: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  allClothesTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  clearFilterText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: "600",
    color: colors.accent,
  },
  emptyCategoryContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EFECE6",
    marginTop: spacing.md,
  },
  emptyCategoryIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FDFBF7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  emptyCategoryTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  emptyCategorySubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  addCategoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
  },
  addCategoryBtnText: {
    ...typography.button,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
