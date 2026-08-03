import { useCallback } from "react";
import {
  FlatList,
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
import { Badge } from "@/components/ui/Badge";
import { CachedImage } from "@/components/ui/CachedImage";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSkeletonCard } from "@/components/ui/LoadingSkeleton";
import { colors, radius, spacing, typography } from "@/theme";
import {
  RECOMMENDATION_OCCASIONS,
  useRecommendationsData,
} from "@/features/recommendations";
import type { AIRecommendationItemV1 } from "@/features/recommendations";

export default function RecommendationsScreen() {
  const { recommendations, aiState, occasion, season: _season, error, actions } =
    useRecommendationsData();

  useFocusEffect(
    useCallback(() => {
      void actions.fetchRecommendations();
    }, [actions.fetchRecommendations]),
  );

  // Setting the filter is enough: it re-creates fetchRecommendations,
  // which re-fires the focus effect above and refetches exactly once.
  const handleSelectOccasion = useCallback(
    (val: string) => {
      actions.setOccasion(val);
    },
    [actions],
  );

  const _handleSelectSeason = useCallback(
    (val: string) => {
      actions.setSeason(val);
    },
    [actions],
  );

  const loading = aiState === "loading" && recommendations.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessibilityRole="header">
            AI Outfit Stylist
          </Text>
        </View>

        <Badge label="AI ENGINE" variant="warning" size="sm" />
      </View>

      {/* Occasion Filter Strip */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {RECOMMENDATION_OCCASIONS.map((occ) => (
            <Chip
              key={occ.value || "all_occ"}
              label={occ.label}
              selected={occasion === occ.value}
              onPress={() => handleSelectOccasion(occ.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Main Recommendations Content */}
      {loading ? (
        <View style={styles.skeletonWrapper}>
          <LoadingSkeletonCard />
        </View>
      ) : error && recommendations.length === 0 ? (
        <View style={styles.centered}>
          <ErrorMessage
            message={error}
            onRetry={() => actions.fetchRecommendations()}
          />
        </View>
      ) : recommendations.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            icon="✨"
            title="No Outfits Found"
            description="Try selecting a different occasion or adding more clothing items to your wardrobe."
            actionLabel="Add Clothing"
            onAction={() => router.push("/upload/capture")}
          />
        </View>
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          windowSize={5}
          maxToRenderPerBatch={5}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={aiState === "loading"}
              onRefresh={() => actions.fetchRecommendations()}
              tintColor={colors.textSecondary}
            />
          }
          renderItem={({ item, index }) => (
            <RecommendationCard
              recommendation={item}
              onPress={() =>
                router.push({
                  pathname: "/recommendations/[id]",
                  params: { id: item.id, index: String(index) },
                })
              }
              onFeedback={(type) => actions.submitFeedback(item.id, type)}
              onSaveToLooks={() => actions.saveToLooks(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function RecommendationCard({
  recommendation,
  onPress,
  onFeedback,
  onSaveToLooks,
}: {
  recommendation: AIRecommendationItemV1;
  onPress: () => void;
  onFeedback: (type: "like" | "dislike") => void;
  onSaveToLooks: () => void;
}) {
  return (
    <Card
      variant="elevated"
      padding={0}
      onPress={onPress}
      style={styles.card}
      accessibilityLabel={recommendation.title}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{recommendation.title}</Text>
        <Badge
          label={`${recommendation.matchScore}% MATCH`}
          variant="default"
          size="sm"
        />
      </View>

      {/* Item Images Grid */}
      <View style={styles.itemGrid}>
        {recommendation.items.map((item) => (
          <View key={item.id} style={styles.itemCell}>
            <CachedImage
              uri={item.thumbnail_url || item.segmented_image_url}
              style={styles.itemImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </View>

      {/* AI Explanation */}
      <View style={styles.explanationBox}>
        <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
        <Text style={styles.explanationText} numberOfLines={2}>
          {recommendation.explanation}
        </Text>
      </View>

      {/* Actions Bar */}
      <View style={styles.cardActions}>
        <View style={styles.feedbackGroup}>
          <TouchableOpacity
            onPress={() => onFeedback("like")}
            style={styles.iconActionBtn}
            accessibilityRole="button"
            accessibilityLabel="Like outfit"
          >
            <Ionicons name="thumbs-up-outline" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onFeedback("dislike")}
            style={styles.iconActionBtn}
            accessibilityRole="button"
            accessibilityLabel="Dislike outfit"
          >
            <Ionicons name="thumbs-down-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onSaveToLooks}
          style={styles.saveActionBtn}
          accessibilityRole="button"
          accessibilityLabel="Save to looks"
        >
          <Ionicons name="bookmark-outline" size={16} color={colors.textPrimary} />
          <Text style={styles.saveActionText}>Save to Looks</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  filterSection: {
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.massive,
  },
  skeletonWrapper: {
    padding: spacing.xl,
  },
  centered: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyWrapper: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  card: {
    marginBottom: spacing.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 15,
    color: colors.textPrimary,
  },
  itemGrid: {
    flexDirection: "row",
    height: 140,
    backgroundColor: colors.border,
  },
  itemCell: {
    flex: 1,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.surface,
    backgroundColor: colors.surface,
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  explanationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  explanationText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  feedbackGroup: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  iconActionBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  saveActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  saveActionText: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
