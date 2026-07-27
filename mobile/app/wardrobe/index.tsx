import { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useWardrobe } from "../../hooks/useWardrobe";
import { useAuth } from "../../providers/AuthProvider";
import { Button, ErrorMessage } from "../../components/ui";
import { SearchBar } from "../../components/ui/SearchBar";
import { CategoryFilter } from "../../components/wardrobe/CategoryFilter";
import { ClothingCard } from "../../components/wardrobe/ClothingCard";
import { colors, fontSize, fontWeight, spacing } from "../../lib/theme";

const NUM_COLUMNS = 2;

export default function WardrobeScreen() {
  const {
    items,
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

  // Refresh on mount and whenever the screen regains focus (after save,
  // edit, or delete flows navigate back here)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // ── Header (memoised to prevent FlatList from remounting it on scroll) ──

  const ListHeader = useMemo(
    () => (
      <View>
        <View style={styles.header}>
          <Text style={styles.title}>My Wardrobe</Text>
          <View style={styles.headerRight}>
            <Button label="Outfits" onPress={() => router.push("/recommendations")} variant="ghost" />
            <Button label="+ Add" onPress={() => router.push("/upload/capture")} variant="ghost" />
            <Button label="Sign Out" onPress={signOut} variant="ghost" />
          </View>
        </View>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <CategoryFilter selected={categoryFilter} onSelect={setCategoryFilter} />
      </View>
    ),
    [searchQuery, categoryFilter, signOut, setSearchQuery, setCategoryFilter],
  );

  // ── Loading (initial) ──

  if (loading && items.length === 0 && !error) {
    return (
      <View style={styles.container}>
        {ListHeader}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // ── Error (initial) ──

  if (error && items.length === 0) {
    return (
      <View style={styles.container}>
        {ListHeader}
        <View style={styles.centered}>
          <ErrorMessage message={error} onRetry={refresh} />
        </View>
      </View>
    );
  }

  // ── Empty ──

  if (!loading && items.length === 0) {
    return (
      <View style={styles.container}>
        {ListHeader}
        <View style={styles.centered}>
          {searchQuery || categoryFilter ? (
            <>
              <Text style={styles.emptyTitle}>No matching items</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search or filter.
              </Text>
              <Button
                label="Clear Filters"
                onPress={() => {
                  setSearchQuery("");
                  setCategoryFilter("");
                }}
              />
            </>
          ) : (
            <>
              <Text style={styles.emptyTitle}>Your wardrobe is empty</Text>
              <Text style={styles.emptySubtitle}>
                Take a photo of your first clothing item to get started.
              </Text>
              <Button
                label="Add First Item"
                onPress={() => router.push("/upload/capture")}
              />
            </>
          )}
        </View>
      </View>
    );
  }

  // ── Grid ──

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <ClothingCard
            item={item}
            onPress={() => router.push(`/items/${item.id}`)}
            onLongPress={() => confirmDelete(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  gridContent: {
    paddingBottom: spacing.xxl,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
