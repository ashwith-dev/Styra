/**
 * CategoryItemsSheet.tsx
 *
 * Slide-up Bottom Sheet Modal displaying clothing items for a specific wardrobe category
 * (e.g. Tops, Bottom Wear, Outerwear, Shoes, Accessories, Other).
 */

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ClothingItemBrief } from "@/lib/types";
import { colors, radius, spacing, typography } from "@/theme";
import { ClothingCard } from "@/components/wardrobe/ClothingCard";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CategoryItemsSheetProps {
  visible: boolean;
  categoryLabel: string;
  items: ClothingItemBrief[];
  onClose: () => void;
  onPressItem: (id: string) => void;
  onLongPressItem?: (id: string) => void;
  onAddClothing: () => void;
}

export function CategoryItemsSheet({
  visible,
  categoryLabel,
  items,
  onClose,
  onPressItem,
  onLongPressItem,
  onAddClothing,
}: CategoryItemsSheetProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop Pressable to Close */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Slide-Up Bottom Sheet */}
        <View style={styles.sheetContainer}>
          {/* Drag Handle Indicator */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Sheet Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.title}>{categoryLabel}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {items.length} {items.length === 1 ? "Item" : "Items"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Items Grid or Empty State */}
          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="shirt-outline" size={32} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No {categoryLabel} Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first {categoryLabel.toLowerCase()} item to build your wardrobe!
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => {
                  onClose();
                  onAddClothing();
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={18} color={colors.surface} />
                <Text style={styles.emptyAddBtnText}>Add {categoryLabel}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={items}
              numColumns={2}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.gridContent}
              columnWrapperStyle={styles.gridRow}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <ClothingCard
                  item={item}
                  onPress={() => {
                    onClose();
                    onPressItem(item.id);
                  }}
                  onLongPress={() => onLongPressItem?.(item.id)}
                />
              )}
            />
          )}

          {/* Bottom Add Item Pill */}
          {items.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  onClose();
                  onAddClothing();
                }}
                activeOpacity={0.88}
              >
                <Ionicons name="add" size={18} color={colors.surface} />
                <Text style={styles.addBtnText}>Add New {categoryLabel}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    maxHeight: SCREEN_HEIGHT * 0.82,
    minHeight: SCREEN_HEIGHT * 0.45,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridContent: {
    paddingBottom: spacing.xl,
  },
  gridRow: {
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.xs,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radius.full,
  },
  emptyAddBtnText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  footer: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    paddingVertical: 14,
  },
  addBtnText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
});
