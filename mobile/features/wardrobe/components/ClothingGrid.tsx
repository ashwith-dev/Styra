import {
  FlatList,
  RefreshControl,
  StyleSheet,
} from "react-native";
import type { ClothingItemBrief } from "@/lib/types";
import { colors, spacing } from "@/theme";
import { ClothingCard } from "@/components/wardrobe/ClothingCard";

const NUM_COLUMNS = 2;

interface ClothingGridProps {
  items: ClothingItemBrief[];
  loading: boolean;
  onRefresh: () => void;
  onPressItem: (id: string) => void;
  onLongPressItem: (id: string) => void;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  testID?: string;
}

/**
 * 2-column FlatList grid.
 *
 * Reuses the existing ClothingCard component from components/wardrobe.
 * Extracts the grid layout concern from the screen into a dedicated component.
 */
export function ClothingGrid({
  items,
  loading,
  onRefresh,
  onPressItem,
  onLongPressItem,
  ListHeaderComponent,
  ListFooterComponent,
  testID,
}: ClothingGridProps) {
  return (
    <FlatList
      testID={testID}
      data={items}
      numColumns={NUM_COLUMNS}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={styles.content}
      columnWrapperStyle={styles.row}
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
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 120,
  },
  row: {
    justifyContent: "space-between",
  },
});
