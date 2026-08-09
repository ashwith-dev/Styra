/**
 * EditOutfitModal.tsx
 *
 * Full-screen edit modal matching user sketch #2 for STYRA.
 * Allows replacing, adding, or deleting items from the current outfit.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CachedImage } from "@/components/ui/CachedImage";
import { colors, radius, spacing, typography } from "@/theme";
import type { OutfitItemResponse } from "@/lib/types";
import { listClothing } from "@/lib/api";
import type { ClothingItemBrief } from "@/lib/types";

function extractAttrValue(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "value" in val) {
    return String((val as { value: unknown }).value);
  }
  return "";
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getClothingItemName(item: ClothingItemBrief): string {
  const attrs = item.attributes ?? {};
  // Direct name check
  if (typeof attrs.name === "string" && attrs.name.trim()) return attrs.name.trim();

  // ClothingItemBrief carries category/type/color only inside `attributes`.
  const color = extractAttrValue(attrs.color);
  const type = extractAttrValue(attrs.type);
  const cat = extractAttrValue(attrs.category);

  if (color && type) return `${capitalize(color)} ${capitalize(type)}`;
  if (type) return capitalize(type);
  if (color && cat) return `${capitalize(color)} ${capitalize(cat)}`;
  if (cat) return capitalize(cat);

  return "Clothing Item";
}

function getClothingItemCategory(item: ClothingItemBrief): string {
  const attrs = item.attributes ?? {};
  return (
    extractAttrValue(attrs.category) ||
    extractAttrValue(attrs.type)
  ).toLowerCase();
}

function matchCategory(item: ClothingItemBrief, filter: string): boolean {
  const cat = getClothingItemCategory(item);
  const type = extractAttrValue(item.attributes?.type).toLowerCase();
  const name = getClothingItemName(item).toLowerCase();
  const target = filter.toLowerCase();

  if (target === "all" || !target) return true;

  if (target.includes("top") || target.includes("shirt")) {
    return (
      cat.includes("top") ||
      type.includes("top") ||
      type.includes("shirt") ||
      name.includes("shirt") ||
      name.includes("top")
    );
  }
  if (
    target.includes("bottom") ||
    target.includes("pant") ||
    target.includes("jean") ||
    target.includes("short") ||
    target.includes("trouser")
  ) {
    return (
      cat.includes("bottom") ||
      type.includes("bottom") ||
      type.includes("pant") ||
      type.includes("jean") ||
      name.includes("pant") ||
      name.includes("jean") ||
      name.includes("trouser")
    );
  }
  if (
    target.includes("footwear") ||
    target.includes("shoe") ||
    target.includes("sneaker")
  ) {
    return (
      cat.includes("footwear") ||
      cat.includes("shoe") ||
      type.includes("shoe") ||
      type.includes("sneaker") ||
      name.includes("shoe") ||
      name.includes("sneaker")
    );
  }
  if (
    target.includes("outerwear") ||
    target.includes("jacket") ||
    target.includes("coat")
  ) {
    return (
      cat.includes("outerwear") ||
      cat.includes("jacket") ||
      type.includes("jacket") ||
      type.includes("coat") ||
      name.includes("jacket") ||
      name.includes("coat")
    );
  }
  return cat.includes(target) || type.includes(target) || name.includes(target);
}

interface EditOutfitModalProps {
  visible: boolean;
  items: OutfitItemResponse[];
  onClose: () => void;
  onSave: (updatedItems: OutfitItemResponse[]) => void;
}

export function EditOutfitModal({
  visible,
  items: initialItems,

  onClose,
  onSave,
}: EditOutfitModalProps) {
  const [currentItems, setCurrentItems] = useState<OutfitItemResponse[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItemBrief[]>([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(false);

  // Category picker state for swap / add item
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState<string | null>(null);
  const [swapTargetIndex, setSwapTargetIndex] = useState<number | null>(null);

  // Load wardrobe items for picker. Tracked with a ref — deriving the guard
  // from wardrobeItems.length makes loadWardrobe's identity change when the
  // fetch resolves, which re-runs the seeding effect below and wipes edits.
  const wardrobeLoadedRef = useRef(false);

  const loadWardrobe = useCallback(async () => {
    if (wardrobeLoadedRef.current) return;
    wardrobeLoadedRef.current = true;
    setLoadingWardrobe(true);
    try {
      const list = await listClothing();
      setWardrobeItems(list);
    } catch {
      wardrobeLoadedRef.current = false; // allow retry on next open
    } finally {
      setLoadingWardrobe(false);
    }
  }, []);

  // Seed editable items only on the closed → open transition, so an
  // in-flight wardrobe fetch resolving can't reset the user's edits.
  const wasVisibleRef = useRef(false);
  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setCurrentItems([...initialItems]);
      void loadWardrobe();
    }
    wasVisibleRef.current = visible;
  }, [visible, initialItems, loadWardrobe]);


  const handleOpenSwap = useCallback(
    (index: number, category?: string) => {
      setSwapTargetIndex(index);
      setPickerCategoryFilter(category ? category.toLowerCase() : null);
      setPickerVisible(true);
      void loadWardrobe();
    },
    [loadWardrobe],
  );

  const handleOpenAddItems = useCallback(() => {
    setSwapTargetIndex(null);
    setPickerCategoryFilter(null);
    setPickerVisible(true);
    void loadWardrobe();
  }, [loadWardrobe]);

  const handleSelectWardrobeItem = useCallback(
    (item: ClothingItemBrief) => {
      const formatted: OutfitItemResponse = {
        id: item.id,
        category: extractAttrValue(item.attributes?.category) || undefined,
        type: extractAttrValue(item.attributes?.type) || undefined,
        color: extractAttrValue(item.attributes?.color) || undefined,
        attributes: item.attributes ?? {},
        thumbnail_url: item.thumbnail_url ?? item.segmented_image_url ?? null,
        image_url: item.original_image_url ?? null,
      };

      if (swapTargetIndex !== null && swapTargetIndex < currentItems.length) {
        // Swap item at swapTargetIndex
        const next = [...currentItems];
        next[swapTargetIndex] = formatted;
        setCurrentItems(next);
      } else {
        // Add new item
        setCurrentItems((prev) => [...prev, formatted]);
      }
      setPickerVisible(false);
    },
    [swapTargetIndex, currentItems],
  );

  const handleRemoveItem = useCallback((index: number) => {
    setCurrentItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    onSave(currentItems);
  }, [onSave, currentItems]);

  // Filter wardrobe items by category filter
  const filteredWardrobe = pickerCategoryFilter
    ? wardrobeItems.filter((i) => matchCategory(i, pickerCategoryFilter))
    : wardrobeItems;



  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header matching Sketch 2: X close top-left, centered title */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Outfit Items</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Vertical item cards list */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {currentItems.map((item, index) => {
            const uri = item.thumbnail_url ?? item.image_url ?? null;
            const categoryName = (item.category ?? item.type ?? "Item").toUpperCase();

            return (
              <View key={item.id + index} style={styles.itemCard}>
                {/* Left: Square Image */}
                <View style={styles.itemImageContainer}>
                  {uri ? (
                    <CachedImage uri={uri} style={styles.itemImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.itemImagePlaceholder}>
                      <Ionicons name="shirt-outline" size={28} color={colors.textSecondary} />
                    </View>
                  )}
                </View>

                {/* Right Column: category name pill & edit button */}
                <View style={styles.itemRightCol}>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText} numberOfLines={1}>
                      {categoryName}
                    </Text>
                  </View>

                  <View style={styles.itemActionsRow}>
                    <TouchableOpacity
                      style={styles.editItemBtn}
                      onPress={() => handleOpenSwap(index, item.category)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.editItemBtnText}>Edit / Swap</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteItemBtn}
                      onPress={() => handleRemoveItem(index)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom Action Controls matching Sketch 2: Save Outfit primary button, Add Items & Discard below */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Outfit</Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleOpenAddItems} activeOpacity={0.8}>
              <Ionicons name="add" size={16} color={colors.textPrimary} />
              <Text style={styles.secondaryBtnText}>Add Items</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={[styles.secondaryBtnText, { color: colors.error }]}>Discard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Wardrobe Item Picker Sub-Modal */}
      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View style={styles.pickerBackdrop}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                {pickerCategoryFilter
                  ? `Select ${pickerCategoryFilter.toUpperCase()}`
                  : "Select Clothing Item"}
              </Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Category Filter Pills in Picker Sheet */}
            <View style={styles.pickerTabsRow}>
              {["All", "Top", "Bottom", "Footwear", "Outerwear"].map((cat) => {
                const isActive =
                  cat === "All"
                    ? !pickerCategoryFilter
                    : pickerCategoryFilter?.toLowerCase().includes(cat.toLowerCase());

                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.pickerTab, isActive && styles.pickerTabActive]}
                    onPress={() => setPickerCategoryFilter(cat === "All" ? null : cat.toLowerCase())}
                  >
                    <Text style={[styles.pickerTabText, isActive && styles.pickerTabTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>


            {loadingWardrobe ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.textPrimary} />
              </View>
            ) : (
              <FlatList
                data={filteredWardrobe}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.pickerGrid}
                renderItem={({ item }) => {
                  const uri = item.thumbnail_url ?? item.segmented_image_url ?? item.original_image_url;
                  const itemName = getClothingItemName(item);
                  const itemCat = getClothingItemCategory(item).toUpperCase();

                  return (
                    <TouchableOpacity
                      style={styles.pickerCard}
                      onPress={() => handleSelectWardrobeItem(item)}
                      activeOpacity={0.8}
                    >
                      {uri ? (
                        <CachedImage uri={uri} style={styles.pickerImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.pickerImagePlaceholder}>
                          <Ionicons name="shirt-outline" size={24} color={colors.textSecondary} />
                        </View>
                      )}
                      <Text style={styles.pickerLabel} numberOfLines={1}>
                        {itemName}
                      </Text>
                      {Boolean(itemCat) && (
                        <Text style={styles.pickerSublabel} numberOfLines={1}>
                          {itemCat}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                }}

              />
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.md,
  },
  itemImageContainer: {
    width: 90,
    height: 90,
    borderRadius: radius.sm,
    backgroundColor: "#F7F5F0",
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F5F0",
  },
  itemRightCol: {
    flex: 1,
    gap: spacing.sm,
  },
  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  itemActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  editItemBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: radius.full,
    paddingVertical: 8,
    alignItems: "center",
  },
  editItemBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  deleteItemBtn: {
    padding: 8,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  saveBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.surface,
    letterSpacing: 0.3,
  },
  secondaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: "80%",
    padding: spacing.lg,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  pickerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  pickerTabsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  pickerTab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pickerTabActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  pickerTabText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  pickerTabTextActive: {
    color: colors.surface,
  },

  loadingContainer: {
    padding: spacing.xxl,
    alignItems: "center",
  },
  pickerGrid: {
    gap: spacing.sm,
  },
  pickerCard: {
    flex: 1,
    margin: 4,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.xs,
    alignItems: "center",
  },
  pickerImage: {
    width: "100%",
    height: 100,
    borderRadius: radius.sm,
  },
  pickerImagePlaceholder: {
    width: "100%",
    height: 100,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 4,
  },
  pickerSublabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});
