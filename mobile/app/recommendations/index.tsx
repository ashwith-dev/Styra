import { memo, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useRecommendations, OCCASIONS, SEASONS } from "../../hooks/useRecommendations";
import { FilterChips } from "../../components/recommendations/FilterChips";
import { ErrorMessage, CachedImage } from "../../components/ui";
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from "../../lib/theme";

function attrValue(attrs: Record<string, unknown>, key: string): string {
  const v = (attrs[key] as any)?.value;
  return typeof v === "string" ? v : "";
}

function outfitLabel(attrs: Record<string, unknown>): string {
  const color = attrValue(attrs, "color");
  const type = attrValue(attrs, "type");
  return [color, type].filter(Boolean).join(" ") || "Item";
}

// ── Skeleton card shown during initial load ──

const SKELETON_ITEMS = Array.from({ length: 4 });

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.skeletonBadge} />
        <View style={[styles.skeletonBlock, { width: 48, height: 24 }]} />
      </View>
      <View style={styles.thumbnailRow}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.skeletonThumb} />
        ))}
      </View>
      <View style={[styles.skeletonBlock, { width: "80%", height: 14, marginTop: spacing.sm }]} />
      <View style={[styles.skeletonBlock, { width: "60%", height: 14, marginTop: spacing.xs }]} />
    </View>
  );
}

function SkeletonList() {
  return (
    <>
      <Header />
      {SKELETON_ITEMS.map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}

// ── Header (styled to match existing design exactly) ──

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Outfits</Text>
    </View>
  );
}

// ── FilterBar ──

const FilterBar = memo(function FilterBar({
  occasion,
  onOccasionChange,
  season,
  onSeasonChange,
}: {
  occasion: string;
  onOccasionChange: (v: string) => void;
  season: string;
  onSeasonChange: (v: string) => void;
}) {
  return (
    <View style={styles.filterBar}>
      <Text style={styles.filterLabel}>Occasion</Text>
      <FilterChips
        options={OCCASIONS}
        selected={occasion}
        onSelect={onOccasionChange}
      />
      <Text style={styles.filterLabel}>Season</Text>
      <FilterChips
        options={SEASONS}
        selected={season}
        onSelect={onSeasonChange}
      />
    </View>
  );
});

// ── Recommendation card (memoised) ──

const RecommendationCard = memo(function RecommendationCard({ rec }: { rec: any }) {
  const scoreColor =
    rec.score >= 70 ? "#2E7D32" : rec.score >= 40 ? "#E65100" : colors.error;

  return (
    <View style={styles.card}>
      {/* Category badge + score */}
      <View style={styles.cardHeader}>
        <Text style={styles.categoryBadge}>{formatCategory(rec.outfit_category)}</Text>
        <Text style={[styles.score, { color: scoreColor }]}>
          {rec.score.toFixed(0)}%
        </Text>
      </View>

      {/* Thumbnail row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbnailRow}
      >
        {rec.outfit_items.map((item: any) => (
          <View key={item.id} style={styles.thumbnailWrapper}>
            <CachedImage
              uri={item.thumbnail_url}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <Text style={styles.thumbnailLabel} numberOfLines={1}>
              {outfitLabel(item.attributes)}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Explanation */}
      <Text style={styles.explanation}>{rec.explanation}</Text>
    </View>
  );
});

// ── Helpers ──

function formatCategory(cat: string): string {
  return cat
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Main screen ──

export default function RecommendationsScreen() {
  const {
    recommendations,
    loading,
    error,
    occasion,
    setOccasion,
    season,
    setSeason,
    refresh,
  } = useRecommendations();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleCardPress = useCallback((index: number) => {
    router.push(`/recommendations/${index}`);
  }, []);

  // ── Skeleton / initial loading — show skeleton cards instead of spinner ──

  if (loading && recommendations.length === 0 && !error) {
    return (
      <View style={styles.container}>
        <ScrollView>
          <SkeletonList />
        </ScrollView>
      </View>
    );
  }

  // ── Initial error (no cached data) ──

  if (error && recommendations.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView>
          <Header />
          <View style={styles.centered}>
            <ErrorMessage message={error} onRetry={refresh} />
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Empty state ──

  if (!loading && recommendations.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView>
          <Header />
          <FilterBar
            occasion={occasion}
            onOccasionChange={setOccasion}
            season={season}
            onSeasonChange={setSeason}
          />
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>No recommendations yet</Text>
            <Text style={styles.emptySubtitle}>
              Add more clothing items to your wardrobe to get outfit suggestions.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Main list ──

  const listHeader = useMemo(
    () => (
      <>
        <Header />
        <FilterBar
          occasion={occasion}
          onOccasionChange={setOccasion}
          season={season}
          onSeasonChange={setSeason}
        />
      </>
    ),
    [occasion, season, setOccasion, setSeason],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.outfit_id}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleCardPress(index)}
          >
            <RecommendationCard rec={item} />
          </TouchableOpacity>
        )}
        // ── FlatList performance optimisations ──
        windowSize={5}
        maxToRenderPerBatch={5}
        removeClippedSubviews
        initialNumToRender={4}
      />
    </View>
  );
}

// ── Styles (unchanged from original) ──

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  filterBar: {
    paddingBottom: spacing.sm,
  },
  filterLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxl,
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
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    ...shadows.md,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  categoryBadge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
  },
  score: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  thumbnailRow: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  thumbnailWrapper: {
    alignItems: "center",
    width: 72,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  thumbnailLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  explanation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Skeleton styles
  skeletonBadge: {
    width: 64,
    height: 20,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  skeletonBlock: {
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  skeletonThumb: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
});
