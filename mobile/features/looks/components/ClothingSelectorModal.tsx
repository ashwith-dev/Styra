import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { CachedImage } from "@/components/ui/CachedImage";
import { colors, radius, spacing, typography } from "@/theme";
import type { ClothingSelectorModalProps } from "../types/looks";

export function ClothingSelectorModal({
  visible,
  items,
  selectedIds,
  onToggleItem,
  onConfirm,
  onClose,
}: ClothingSelectorModalProps) {
  const selectedSet = new Set(selectedIds);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close selection"
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Select Wardrobe Items
          </Text>
          <TouchableOpacity
            onPress={onConfirm}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Confirm selection"
          >
            <Text style={styles.confirmHeaderLabel}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Selected count info */}
        <View style={styles.subHeader}>
          <Text style={styles.subHeaderCount}>
            {selectedIds.length} {selectedIds.length === 1 ? "item" : "items"} selected
          </Text>
        </View>

        {/* Wardrobe Items Grid */}
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No wardrobe items available.</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            numColumns={3}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.gridContent}
            renderItem={({ item }) => {
              const selected = selectedSet.has(item.id);
              const imageUrl = item.thumbnail_url || item.segmented_image_url;

              return (
                <TouchableOpacity
                  style={[styles.itemCell, selected && styles.itemCellSelected]}
                  onPress={() => onToggleItem(item.id)}
                  activeOpacity={0.8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                >
                  <CachedImage
                    uri={imageUrl}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  {selected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Footer Action */}
        <View style={styles.footer}>
          <Button
            label={`Confirm Selection (${selectedIds.length})`}
            onPress={onConfirm}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.primaryBtn}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  confirmHeaderLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.accent,
  },
  subHeader: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  subHeaderCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  gridContent: {
    padding: spacing.sm,
  },
  itemCell: {
    flex: 1 / 3,
    margin: spacing.xxs,
    aspectRatio: 1,
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  itemCellSelected: {
    borderColor: colors.textPrimary,
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  checkBadge: {
    position: "absolute",
    top: spacing.xxs,
    right: spacing.xxs,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  primaryBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
  },
});
