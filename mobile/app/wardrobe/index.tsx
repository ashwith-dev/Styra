import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useAuth } from "@/providers/AuthProvider";
import { ErrorMessage, SearchBar } from "@/components/ui";
import { colors, spacing } from "@/theme";
import {
  AddItemFAB,
  CategoryFilter,
  ClothingGrid,
  WardrobeEmptyState,
  WardrobeHeader,
  WardrobeLoadingSkeleton,
} from "@/features/wardrobe";

/**
 * Wardrobe main screen.
 *
 * Layout:
 *   SafeAreaView
 *     WardrobeHeader     — title, subtitle, item count
 *     SearchBar          — live client-side search
 *     WardrobeCategoryFilter — horizontal category chips
 *     [Loading]          — WardrobeLoadingSkeleton
 *     [Error]            — ErrorMessage + retry
 *     [Empty]            — WardrobeEmptyState
 *     [Grid]             — ClothingGrid (2-col, pull-to-refresh)
 *   AddItemFAB           — fixed bottom-right
 */
export default function WardrobeScreen() {
  const {
    items,
    allItems,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    refresh,
    confirmDelete,
  } = useWardrobe();

  const { signOut } = useAuth();

  // Refresh whenever the screen regains focus (after add/edit/delete flows)
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleAddItem = useCallback(() => {
    router.push("/upload/capture");
  }, []);

  const handleItemPress = useCallback((id: string) => {
    router.push(`/items/${id}`);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter("");
  }, [setSearchQuery, setCategoryFilter]);

  const isFiltered = Boolean(searchQuery || categoryFilter);

  // ── Memoised sticky list header ──
  const ListHeader = useMemo(
    () => (
      <View>
        <WardrobeHeader
          itemCount={allItems.length}
          onSignOut={signOut}
        />
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search wardrobe..."
          style={styles.searchBar}
          testID="wardrobe-search"
        />
        <CategoryFilter
          selected={categoryFilter}
          onSelect={setCategoryFilter}
          testID="wardrobe-category-filter"
        />
      </View>
    ),
    [searchQuery, categoryFilter, allItems.length, signOut, setSearchQuery, setCategoryFilter],
  );

  // ── Initial loading ──
  if (loading && allItems.length === 0 && !error) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {ListHeader}
        <WardrobeLoadingSkeleton />
      </SafeAreaView>
    );
  }

  // ── Initial error ──
  if (error && allItems.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {ListHeader}
        <View style={styles.centered}>
          <ErrorMessage message={error} onRetry={refresh} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty (no items OR no filtered results) ──
  if (!loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {ListHeader}
        <WardrobeEmptyState
          isFiltered={isFiltered}
          onClearFilters={handleClearFilters}
          onAddItem={handleAddItem}
        />
        <AddItemFAB onPress={handleAddItem} />
      </SafeAreaView>
    );
  }

  // ── Grid ──
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ClothingGrid
        items={items}
        loading={loading}
        onRefresh={refresh}
        onPressItem={handleItemPress}
        onLongPressItem={confirmDelete}
        ListHeaderComponent={ListHeader}
        testID="wardrobe-grid"
      />
      <AddItemFAB onPress={handleAddItem} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xs,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
});
