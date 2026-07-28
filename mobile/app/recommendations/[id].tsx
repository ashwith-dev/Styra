import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ClothingCard } from "@/components/wardrobe/ClothingCard";
import { colors, radius, spacing, typography } from "@/theme";
import { useRecommendationsData } from "@/features/recommendations";

export default function RecommendationDetailScreen() {
  const { index } = useLocalSearchParams<{ id: string; index: string }>();
  const { recommendations, error, actions } = useRecommendationsData();

  const idx = index ? parseInt(index, 10) : 0;
  const recommendation = recommendations[idx];

  const handleItemPress = useCallback((itemId: string) => {
    router.push(`/items/${itemId}`);
  }, []);

  const handleSaveToLooks = useCallback(async () => {
    if (!recommendation) return;
    const success = await actions.saveToLooks(recommendation.id);
    if (success) {
      router.push("/looks");
    }
  }, [recommendation, actions]);

  if (!recommendation) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ErrorMessage message={error || "Outfit recommendation not found."} />
          <Button
            label="Back to Recommendations"
            onPress={() => router.back()}
            variant="ghost"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">
          Outfit Detail
        </Text>
        <TouchableOpacity
          onPress={handleSaveToLooks}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Save to looks"
        >
          <Ionicons name="bookmark-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Score */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{recommendation.title}</Text>
            <Badge
              label={`${recommendation.matchScore}% MATCH`}
              variant="default"
              size="md"
            />
          </View>
        </View>

        {/* AI Rationale Box */}
        <View style={styles.explanationCard}>
          <View style={styles.explanationHeader}>
            <Ionicons name="sparkles" size={18} color={colors.accent} />
            <Text style={styles.explanationTitle}>Stylist AI Rationale</Text>
          </View>
          <Text style={styles.explanationText}>{recommendation.explanation}</Text>
        </View>

        {/* Items Grid */}
        <Text style={styles.sectionTitle}>
          Items in this Outfit ({recommendation.items.length})
        </Text>

        <View style={styles.gridContainer}>
          {recommendation.items.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              <ClothingCard
                item={item}
                onPress={() => handleItemPress(item.id)}
                onLongPress={() => {}}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Fixed Bottom Save Bar */}
      <View style={styles.bottomBar}>
        <Button
          label="Save Outfit to Looks"
          onPress={handleSaveToLooks}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.primaryBtn}
          testID="save-outfit-to-looks-btn"
        />
      </View>
    </SafeAreaView>
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
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  explanationCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  explanationTitle: {
    ...typography.h3,
    fontSize: 14,
    color: colors.textPrimary,
  },
  explanationText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },
  cardWrapper: {
    width: "50%",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  primaryBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
  },
});
