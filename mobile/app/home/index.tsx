import { useCallback } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSkeletonCard } from "@/components/ui/LoadingSkeleton";
import { colors, spacing } from "@/theme";
import {
  EmptyWardrobeDashboard,
  HOME_CONFIG,
  HomeHeader,
  HomePlaceholders,
  HomeQuickActions,
  HomeWardrobeStats,
  InsufficientWardrobeDashboard,
  RecentClothingStrip,
  useHomeData,
} from "@/features/home";

export default function HomeScreen() {
  const {
    user,
    stats,
    wardrobeValidation,
    recentItems,
    loading,
    error,
    refresh,
    confirmDelete,
  } = useHomeData();

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

        {/* Quick Actions (Show on unlocked home or secondary header) */}
        {wardrobeValidation.isUnlocked && (
          <HomeQuickActions
            onAddClothing={handleAddClothing}
            onViewWardrobe={handleViewWardrobe}
          />
        )}

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
          /* SCREEN 1: EMPTY WARDROBE DASHBOARD */
          <EmptyWardrobeDashboard
            userName={user.name}
            onAddClothing={handleAddClothing}
          />
        ) : !wardrobeValidation.isUnlocked ? (
          /* SCREEN 2: INSUFFICIENT WARDROBE DASHBOARD (NOT ENOUGH ITEMS) */
          <InsufficientWardrobeDashboard
            topsCount={wardrobeValidation.topsCount}
            requiredTops={wardrobeValidation.requiredTops}
            bottomsCount={wardrobeValidation.bottomsCount}
            requiredBottoms={wardrobeValidation.requiredBottoms}
            topsProgress={wardrobeValidation.topsProgress}
            bottomsProgress={wardrobeValidation.bottomsProgress}
            recentItems={recentItems}
            onAddClothing={handleAddClothing}
            onItemPress={handleItemPress}
            onViewWardrobe={handleViewWardrobe}
          />
        ) : (
          /* UNLOCKED HOME DASHBOARD (2+ Tops & 2+ Bottoms) */
          <>
            {/* Recent Clothing Strip */}
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

            {/* AI Outfit Features & Presentation Placeholders */}
            <HomePlaceholders
              weather={HOME_CONFIG.weather}
              todayOutfit={HOME_CONFIG.todayOutfit}
              aiTeaser={HOME_CONFIG.aiTeaser}
            />
          </>
        )}
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
});
