import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { colors, radius, spacing, typography } from "@/theme";
import type { HomePlaceholdersProps } from "../types";

export function HomePlaceholders({
  weather,
  todayOutfit,
  aiTeaser,
}: HomePlaceholdersProps) {
  return (
    <View style={styles.container}>
      {/* Weather Card Placeholder */}
      <Card variant="outlined" padding="md" style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.weatherLeft}>
            <Ionicons
              name={weather.icon as any}
              size={24}
              color={colors.textPrimary}
            />
            <Text style={styles.tempText}>{weather.temp}</Text>
            <Text style={styles.conditionText}>{weather.condition}</Text>
          </View>
          <Badge label="WEATHER" variant="default" size="sm" />
        </View>
        <Text style={styles.suggestionText}>{weather.suggestion}</Text>
      </Card>

      {/* Today's Outfit Placeholder Card */}
      <Card variant="outlined" padding="md" style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{todayOutfit.title}</Text>
          <Badge label={todayOutfit.tag} variant="default" size="sm" />
        </View>
        <Text style={styles.cardSubtitle}>{todayOutfit.subtitle}</Text>
      </Card>

      {/* AI Recommendations Teaser Card */}
      <Card variant="flat" padding="md" style={styles.aiTeaserCard}>
        <View style={styles.rowBetween}>
          <View style={styles.aiTitleRow}>
            <Ionicons name="sparkles" size={18} color={colors.accent} />
            <Text style={styles.aiTitle}>{aiTeaser.title}</Text>
          </View>
          <Badge label={aiTeaser.badge} variant="warning" size="sm" />
        </View>
        <Text style={styles.aiDescription}>{aiTeaser.description}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  weatherLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  tempText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  conditionText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xxs,
  },
  suggestionText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  aiTeaserCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  aiTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  aiDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
});
