import { useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
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
import { LocationBanner } from "@/features/home/components/LocationBanner";
import { useLocationWeather } from "@/hooks/useLocationWeather";

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

  const {
    weatherData,
    locationStatus,
    showLocationBanner,
    dismissBanner,
    triggerLocationWeather,
  } = useLocationWeather();

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

  const isLoadingWeather =
    locationStatus === "requesting_permission" ||
    locationStatus === "fetching_location" ||
    locationStatus === "fetching_weather";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with live temp or '_ • COLLEGE' when not fetched yet */}
          <HomeHeader
            userName={user.name}
            userAvatar={user.avatar}
            greetingTime={user.greetingTime}
            onSignOut={user.signOut}
            liveTemp={weatherData?.temperatureDisplay ?? null}
            userLifestyle={user.lifestyle}
            onContextTagPress={triggerLocationWeather}
          />

          {/* Slim light-red banner — shown below STYRA logo when location is OFF/denied */}
          {showLocationBanner && (
            <LocationBanner
              onOpenSettings={triggerLocationWeather}
              onDismiss={dismissBanner}
            />
          )}

          {/* Quick Actions (Show when wardrobe is unlocked) */}
          {wardrobeValidation.isUnlocked && (
            <HomeQuickActions
              onAddClothing={handleAddClothing}
              onViewWardrobe={handleViewWardrobe}
            />
          )}

          {/* Loading Skeleton */}
          {loading && stats.totalItems === 0 && !error ? (
            <View style={styles.skeletonPadding}>
              <LoadingSkeletonCard />
            </View>
          ) : stats.totalItems === 0 ? (
            /* SCREEN 1: LUXURY EMPTY WARDROBE DASHBOARD */
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

              {/* AI Outfit Features & Live Weather Card */}
              <HomePlaceholders
                weather={HOME_CONFIG.weather}
                todayOutfit={HOME_CONFIG.todayOutfit}
                aiTeaser={HOME_CONFIG.aiTeaser}
                liveWeather={weatherData}
                isLoadingWeather={isLoadingWeather}
                onWeatherCardPress={triggerLocationWeather}
              />
            </>
          )}
        </ScrollView>

        {/* Floating Bottom Navigation Bar */}
        <BottomNavBar activeTab="home" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  scrollContent: {
    paddingBottom: 110,
  },
  skeletonPadding: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
});
