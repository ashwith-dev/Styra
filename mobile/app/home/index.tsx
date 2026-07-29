import { useCallback } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSkeletonCard } from "@/components/ui/LoadingSkeleton";
import { colors, radius, spacing, typography } from "@/theme";
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
        ) : !wardrobeValidation.isUnlocked ? (
          /* Empty / Insufficient Wardrobe State: Requires 2 Tops & 2 Bottoms */
          <View style={styles.guidanceCard}>
            <View style={styles.guidanceIconBox}>
              <Ionicons name="sparkles-outline" size={24} color={colors.textPrimary} />
            </View>

            <Text style={styles.guidanceTitle}>Build Your Wardrobe</Text>
            <Text style={styles.guidanceDescription}>
              Add at least 2 tops and 2 bottoms to unlock AI outfit generation.
            </Text>

            {/* Dynamic Progress Indicators */}
            <View style={styles.progressRowContainer}>
              <View style={styles.progressCounterBox}>
                <Text style={styles.counterLabel}>Tops Added</Text>
                <Text style={styles.counterValue}>
                  {wardrobeValidation.topsCount} / {wardrobeValidation.requiredTops}
                </Text>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${wardrobeValidation.topsProgress * 100}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.progressCounterBox}>
                <Text style={styles.counterLabel}>Bottoms Added</Text>
                <Text style={styles.counterValue}>
                  {wardrobeValidation.bottomsCount} / {wardrobeValidation.requiredBottoms}
                </Text>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${wardrobeValidation.bottomsProgress * 100}%` },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Prominent CTA */}
            <Button
              label="Add Clothing"
              onPress={handleAddClothing}
              variant="primary"
              size="md"
              fullWidth
              style={styles.addClothingBtn}
              testID="home-build-wardrobe-cta"
            />
          </View>
        ) : (
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
          </>
        )}

        {/* AI Outfit Features & Presentation Placeholders (Unlocked only when 2+ tops & 2+ bottoms exist) */}
        {wardrobeValidation.isUnlocked && (
          <HomePlaceholders
            weather={HOME_CONFIG.weather}
            todayOutfit={HOME_CONFIG.todayOutfit}
            aiTeaser={HOME_CONFIG.aiTeaser}
          />
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
  guidanceCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EFECE6",
    alignItems: "center",
  },
  guidanceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F3EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  guidanceTitle: {
    fontFamily: "serif",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  guidanceDescription: {
    ...typography.body,
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  progressRowContainer: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
    marginBottom: spacing.lg,
  },
  progressCounterBox: {
    flex: 1,
    backgroundColor: "#FAF8F5",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  counterLabel: {
    ...typography.caption,
    fontSize: 11,
    color: "#7F7C76",
    marginBottom: 2,
  },
  counterValue: {
    fontFamily: "serif",
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2DFD8",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.textPrimary,
    borderRadius: 2,
  },
  addClothingBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
  },
});
