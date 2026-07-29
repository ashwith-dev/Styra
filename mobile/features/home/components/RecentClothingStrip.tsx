import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ClothingCard } from "@/components/wardrobe/ClothingCard";
import { colors, spacing, typography } from "@/theme";
import type { RecentClothingStripProps } from "../types";

export function RecentClothingStrip({
  items,
  onItemPress,
  onItemLongPress,
  onViewAll,
}: RecentClothingStripProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Recently Added"
        action={
          <TouchableOpacity
            onPress={onViewAll}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="View all wardrobe items"
          >
            <Text style={styles.viewAllLabel}>View All</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => (
          <View key={item.id} style={styles.cardWrapper}>
            <ClothingCard
              item={item}
              onPress={() => onItemPress(item.id)}
              onLongPress={() => onItemLongPress(item.id)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  viewAllLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.accent,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  cardWrapper: {
    width: 140,
  },
});
