import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useAuth } from "@/providers/AuthProvider";
import { BottomNavBar, ErrorMessage, SearchBar } from "@/components/ui";
import { colors, spacing } from "@/theme";
import {
  EmptyWardrobeView,
  PopulatedWardrobeView,
  WardrobeLoadingSkeleton,
  WardrobeScreenHeader,
} from "@/features/wardrobe";

export default function WardrobeScreen() {
  const {
    items,
    allItems,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refresh,
    confirmDelete,
  } = useWardrobe();

  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

  // Auto-refresh when screen gains focus (e.g. after uploading clothing)
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleAddClothing = useCallback(() => {
    router.push("/upload/capture");
  }, []);

  const handleItemPress = useCallback((id: string) => {
    router.push(`/items/${id}`);
  }, []);

  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => !prev);
  }, []);

  // Format display name for Avatar
  const rawName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.first_name;

  const userName = rawName
    ? String(rawName)
    : user?.email
    ? user.email.split("@")[0]
    : "Alex";

  const userAvatar = user?.user_metadata?.avatar_url ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header: STYRA Logo + Search Icon + Profile Avatar */}
        <WardrobeScreenHeader
          userAvatar={userAvatar}
          userName={userName}
          onSearchPress={toggleSearch}
        />

        {/* Optional Search Bar Toggle */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search wardrobe..."
              autoFocus
              testID="wardrobe-search-input"
            />
          </View>
        )}

        {/* Main Content: Automatic Switching between Empty & Populated Wardrobe States */}
        {loading && allItems.length === 0 && !error ? (
          <WardrobeLoadingSkeleton />
        ) : error && allItems.length === 0 ? (
          <View style={styles.centered}>
            <ErrorMessage message={error} onRetry={refresh} />
          </View>
        ) : allItems.length === 0 ? (
          /* STATE 1: EMPTY WARDROBE (IMAGE 1) */
          <EmptyWardrobeView onAddClothing={handleAddClothing} />
        ) : (
          /* STATE 2: WARDROBE WITH CLOTHES (IMAGE 2) */
          <PopulatedWardrobeView
            items={items}
            allItems={allItems}
            loading={loading}
            onRefresh={refresh}
            onPressItem={handleItemPress}
            onLongPressItem={confirmDelete}
          />
        )}

        {/* Floating Bottom Navigation Bar */}
        <BottomNavBar activeTab="wardrobe" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    position: "relative",
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
});
