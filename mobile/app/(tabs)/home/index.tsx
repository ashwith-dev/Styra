import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingSkeletonCard } from "@/components/ui/LoadingSkeleton";
import { colors, spacing } from "@/theme";
import { homeTokens } from "@/features/home/theme/homeTokens";
import {
  EmptyWardrobeDashboard,
  HOME_CONFIG,
  HomeHeader,
  HomePlaceholders,
  HomeQuickActions,
  HomeWardrobeStats,
  HorizontalOutfitCalendar,
  InsufficientWardrobeDashboard,
  useHomeData,
} from "@/features/home";
import { LocationBanner } from "@/features/home/components/LocationBanner";

import { TodayOutfitCard } from "@/features/home/components/TodayOutfitCard";
import { EditOutfitModal } from "@/components/outfits";

import { useLocationWeather } from "@/hooks/useLocationWeather";
import { useTodayOutfit, todayString, type TodayOutfitData } from "@/hooks/useTodayOutfit";
import { useOutfitCalendar } from "@/hooks/useOutfitCalendar";
import { listOutfitFavorites, deleteWearOutfitToday, addOutfitFavorite } from "@/lib/api";
import { createSavedLook } from "@/lib/storage/savedLooks";
import { deleteLook } from "@/repositories/looksRepository";
import type { OutfitItemResponse } from "@/lib/types";



export default function HomeScreen() {
  const {
    user,
    stats,
    wardrobeValidation,
    recentItems,
    loading,
    error,
    refresh,
  } = useHomeData();

  const { todayOutfit, saveTodayOutfit, clearTodayOutfit, getOutfitForDate } = useTodayOutfit();
  const {
    days: calendarDays,
    selectedDayObj,
    selectDate,
    refresh: refreshCalendar,
    todayIndex,
  } = useOutfitCalendar();

  const [selectedDateOutfit, setSelectedDateOutfit] = useState<TodayOutfitData | null>(null);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      if (!selectedDayObj) return;
      if (selectedDayObj.isToday) {
        setSelectedDateOutfit(todayOutfit);
        return;
      }
      const loaded = await getOutfitForDate(selectedDayObj.date);
      if (isMounted) {
        setSelectedDateOutfit(loaded);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [selectedDayObj, todayOutfit, getOutfitForDate]);

  const [savedOutfitsCount, setSavedOutfitsCount] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    listOutfitFavorites()
      .then((favs) => setSavedOutfitsCount(favs.length))
      .catch(() => {/* best-effort */});
  }, []);


  const {
    weatherData,
    locationStatus,
    showLocationBanner,
    dismissBanner,
    triggerLocationWeather,
  } = useLocationWeather();

  const handleAddClothing = useCallback(() => {
    router.push("/upload/capture");
  }, []);

  const handleGenerateOutfit = useCallback(() => {
    const targetDate = selectedDayObj?.date || todayString();
    router.push({
      pathname: "/outfits/generate",
      params: { date: targetDate },
    });
  }, [selectedDayObj]);

  const handleViewOutfit = useCallback(() => {
    router.push("/outfits/history");
  }, []);

  const handleDeleteTodayOutfit = useCallback(async () => {
    try {
      await deleteWearOutfitToday();
    } catch {
      // best-effort
    }
    await clearTodayOutfit();
    await refreshCalendar();
  }, [clearTodayOutfit, refreshCalendar]);

  const [currentSavedOutfitId, setCurrentSavedOutfitId] = useState<string | null>(null);

  // Check backend favorites and local saved looks on mount/focus
  const checkIsSaved = useCallback(async () => {
    try {
      const favs = await listOutfitFavorites();
      setSavedOutfitsCount(favs.length);

      if (todayOutfit) {
        const expectedId = `today-outfit-${todayOutfit.date}`;
        const found = favs.find((f) => f.outfit_id === expectedId || f.id === expectedId);
        if (found) {
          setCurrentSavedOutfitId(expectedId);
        } else {
          setCurrentSavedOutfitId(null);
        }
      }
    } catch {
      // best-effort
    }
  }, [todayOutfit]);

  useEffect(() => {
    void checkIsSaved();
  }, [checkIsSaved]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refreshCalendar();
      void checkIsSaved();
    }, [refresh, refreshCalendar, checkIsSaved]),
  );

  const handleSaveTodayOutfit = useCallback(async () => {
    if (!todayOutfit) return;
    const outfitId = `today-outfit-${todayOutfit.date}`;
    // Optimistic — rolled back below if persistence fails.
    setCurrentSavedOutfitId(outfitId);

    try {
      // 1. Save to backend database (409 = already saved → treat as done)
      try {
        await addOutfitFavorite({
          outfit_id: outfitId,
          outfit_data: {
            outfit_id: outfitId,
            outfit_items: todayOutfit.items.map((item) => ({
              id: item.id,
              attributes: item.attributes || {},
              thumbnail_url: item.thumbnail_url || null,
            })),
            score: todayOutfit.score,
            explanation: todayOutfit.reason,
            outfit_category: "generated",
          },
        });
      } catch (err) {
        if ((err as { statusCode?: number })?.statusCode !== 409) throw err;
      }

      // 2. Save to local storage for Saved Looks screen (/looks) — same
      // deterministic id as the backend favorite so unsave can find it
      // and the /looks merge dedupes the two copies.
      await createSavedLook(
        {
          name: `Today's Outfit (${todayOutfit.occasion || "Casual"})`,
          category: todayOutfit.occasion || "Casual",
          season: "All Season",
          source: "ai",
          items: todayOutfit.items.map((item) => ({
            id: item.id,
            clothing_item_id: item.id,
            thumbnail_url: item.thumbnail_url ?? null,
            segmented_image_url: item.image_url ?? null,
            attributes: item.attributes ?? {},
          })),
          tags: [todayOutfit.occasion || "Casual", todayOutfit.style || "Minimalist"],
        },
        { id: outfitId },
      );

      setSavedOutfitsCount((c) => c + 1);
    } catch {
      setCurrentSavedOutfitId(null);
    }
  }, [todayOutfit]);

  const handleUnsaveTodayOutfit = useCallback(async () => {
    const outfitId = currentSavedOutfitId || (todayOutfit ? `today-outfit-${todayOutfit.date}` : null);
    if (!outfitId) return;
    // Optimistic — rolled back below if persistence fails.
    setCurrentSavedOutfitId(null);
    try {
      // Removes both the backend favorite and the local look (same id).
      await deleteLook(outfitId);
      setSavedOutfitsCount((c) => Math.max(0, c - 1));
    } catch {
      setCurrentSavedOutfitId(outfitId);
    }
  }, [currentSavedOutfitId, todayOutfit]);



  const handleSaveEditedOutfit = useCallback(
    async (updatedItems: OutfitItemResponse[]) => {
      if (!todayOutfit) return;
      try {
        await saveTodayOutfit({
          items: updatedItems,
          score: todayOutfit.score,
          reason: todayOutfit.reason,
          occasion: todayOutfit.occasion,
          style: todayOutfit.style,
        });
        setEditModalVisible(false);
      } catch {
        // Persistence failed — keep the modal open so edits aren't lost.
      }
    },
    [todayOutfit, saveTodayOutfit],
  );



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
          {/* Header with live temp or '_ • REGULAR' when not fetched yet */}
          <HomeHeader
            userName={user.name}
            userAvatar={user.avatar}
            greetingTime={user.greetingTime}
            onSignOut={user.signOut}
            liveTemp={weatherData?.temperatureDisplay ?? null}
            userFitPreference={user.fitPreference}
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

          {/* Horizontal 10-day outfit tracker calendar */}
          {wardrobeValidation.isUnlocked && (
            <HorizontalOutfitCalendar
              days={calendarDays}
              onSelectDate={selectDate}
              todayIndex={todayIndex}
            />
          )}

          {/* Quick Actions (Generate Outfit & Add Clothing) */}
          <HomeQuickActions
            onAddClothing={handleAddClothing}
            onGenerateOutfit={handleGenerateOutfit}
            hasOutfitForSelectedDate={
              selectedDayObj?.isToday
                ? Boolean(todayOutfit)
                : Boolean(selectedDateOutfit || selectedDayObj?.hasOutfit)
            }
            onViewOutfit={handleViewOutfit}
          />

          {/* Outfit Card for Selected Date */}
          {selectedDateOutfit && wardrobeValidation.isUnlocked && (
            <TodayOutfitCard
              outfit={selectedDateOutfit}
              title={
                selectedDayObj?.isToday
                  ? "Todays outfit"
                  : selectedDayObj?.isPast
                  ? `Outfit worn on ${selectedDayObj.weekday}, ${selectedDayObj.dayNum}`
                  : `Planned outfit for ${selectedDayObj?.weekday}, ${selectedDayObj?.dayNum}`
              }
              isReadOnly={Boolean(selectedDayObj?.isPast)}
              onSave={handleSaveTodayOutfit}
              onUnsave={handleUnsaveTodayOutfit}
              onEditOutfit={() => setEditModalVisible(true)}
              onRegenerate={() => router.push("/outfits/generate")}
              onDeleteOutfit={handleDeleteTodayOutfit}
              isInitiallySaved={Boolean(currentSavedOutfitId)}
            />
          )}


          {/* Edit Outfit Modal (matching Sketch #2) */}
          {todayOutfit && (
            <EditOutfitModal
              visible={editModalVisible}
              items={todayOutfit.items}
              onClose={() => setEditModalVisible(false)}
              onSave={handleSaveEditedOutfit}
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
              footwearCount={wardrobeValidation.footwearCount}
              requiredFootwear={wardrobeValidation.requiredFootwear}
              topsProgress={wardrobeValidation.topsProgress}
              bottomsProgress={wardrobeValidation.bottomsProgress}
              footwearProgress={wardrobeValidation.footwearProgress}
              recentItems={recentItems}
              onAddClothing={handleAddClothing}
              onItemPress={handleItemPress}
              onViewWardrobe={() => router.push("/wardrobe")}
            />
          ) : (
            /* UNLOCKED HOME DASHBOARD (2+ Tops & 2+ Bottoms) */
            <>
              {/* Wardrobe Statistics */}
              <HomeWardrobeStats
                totalItems={stats.totalItems}
                categoryCount={stats.categoryCount}
                savedOutfitsCount={savedOutfitsCount}
              />

              {/* Live Weather Card */}
              <HomePlaceholders
                weather={HOME_CONFIG.weather}
                liveWeather={weatherData}
                isLoadingWeather={isLoadingWeather}
                onWeatherCardPress={triggerLocationWeather}
              />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: homeTokens.background,
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
