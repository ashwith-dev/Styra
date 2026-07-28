import { useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSkeletonCard } from "@/components/ui/LoadingSkeleton";
import { colors, spacing } from "@/theme";
import {
  HOME_CONFIG,
  HomeHeader,
  HomePlaceholders,
  HomeQuickActions,
  HomeWardrobeStats,
  RecentClothingStrip,
  useHomeData,
} from "@/features/home";

export default function HomeScreen() {
  const { user, stats, recentItems, loading, error, refresh, confirmDelete } =
    useHomeData();

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleAddClothing = useCallback(() => {
    router.push("/upload/capture");
  }, []);

  const handleViewWardrobe = useCallback(() => {
    router.push("/wardrobe");
  }, []);

  const handleItemPress = useCallback((id: string) => {
    router.push(`/items/${id}`);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.textSecondary}
          />
        }
      >
        {/* Header */}
        <HomeHeader
          userName={user.name}
          userAvatar={user.avatar}
          greetingTime={user.greetingTime}
          onSignOut={user.signOut}
        />

        {/* Quick Actions */}
        <HomeQuickActions
          onAddClothing={handleAddClothing}
          onViewWardrobe={handleViewWardrobe}
        />

        {/* Loading / Error States */}
        {loading && stats.totalItems === 0 && !error ? (
          <View style={styles.skeletonPadding}>
            <LoadingSkeletonCard />
          </View>
        ) : error && stats.totalItems === 0 ? (
          <View style={styles.centered}>
            <ErrorMessage message={error} onRetry={refresh} />
          </View>
        ) : stats.totalItems === 0 ? (
          /* Empty State for new users */
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="✨"
              title="Welcome to STYRA"
              description="Start by adding your first clothing item to build your AI wardrobe."
              actionLabel="Add First Item"
              onAction={handleAddClothing}
              testID="home-empty-state"
            />
          </View>
        ) : (
          <>
            {/* Recent Clothing Strip (reuses ClothingCard) */}
            <RecentClothingStrip
              items={recentItems}
              onItemPress={handleItemPress}
              onItemLongPress={confirmDelete}
              onViewAll={handleViewWardrobe}
            />

            {/* Wardrobe Statistics */}
            <HomeWardrobeStats
              totalItems={stats.totalItems}
              categoryCount={stats.categoryCount}
              topCategory={stats.topCategory}
            />
          </>
        )}

        {/* Presentation Placeholders (Weather, Today's Outfit, AI Teaser) */}
        <HomePlaceholders
          weather={HOME_CONFIG.weather}
          todayOutfit={HOME_CONFIG.todayOutfit}
          aiTeaser={HOME_CONFIG.aiTeaser}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.massive,
  },
  skeletonPadding: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  centered: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
});
