import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { colors, radius, spacing, typography } from "@/theme";
import type { HomePlaceholdersProps } from "../types";

export function HomePlaceholders({
  weather,
  todayOutfit,
  aiTeaser,
  liveWeather,
  isLoadingWeather,
  onWeatherCardPress,
}: HomePlaceholdersProps) {
  // Derive what to display: live data takes priority over static config
  const displayTemp = liveWeather
    ? liveWeather.temperatureDisplay
    : weather.temp;
  const displayCondition = liveWeather
    ? liveWeather.condition
    : weather.condition;
  const displayIcon = liveWeather ? liveWeather.icon : weather.icon;
  const displaySuggestion = liveWeather
    ? buildSuggestion(liveWeather.condition, liveWeather.temperatureCelsius)
    : weather.suggestion;

  const isLive = Boolean(liveWeather);

  return (
    <View style={styles.container}>
      {/* Weather Card — tappable to trigger location fetch */}
      <TouchableOpacity
        onPress={onWeatherCardPress}
        activeOpacity={onWeatherCardPress ? 0.85 : 1}
        disabled={!onWeatherCardPress || isLoadingWeather || isLive}
        accessibilityRole="button"
        accessibilityLabel={
          isLive
            ? `Current weather: ${displayTemp}, ${displayCondition}`
            : "Tap to fetch live weather"
        }
        testID="home-weather-card"
      >
        <Card variant="outlined" padding="md" style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.weatherLeft}>
              {isLoadingWeather ? (
                <ActivityIndicator
                  size="small"
                  color={colors.textPrimary}
                  style={styles.loadingSpinner}
                />
              ) : (
                <Ionicons
                  name={displayIcon as React.ComponentProps<typeof Ionicons>["name"]}
                  size={24}
                  color={colors.textPrimary}
                />
              )}
              <Text style={styles.tempText}>
                {isLoadingWeather ? "—" : displayTemp}
              </Text>
              <Text style={styles.conditionText}>
                {isLoadingWeather ? "Fetching…" : displayCondition}
              </Text>
            </View>
            <View style={styles.badgeRow}>
              {isLive && (
                <View style={styles.liveDot} accessibilityLabel="Live weather data" />
              )}
              <Badge label="WEATHER" variant="default" size="sm" />
            </View>
          </View>
          <Text style={styles.suggestionText}>
            {isLoadingWeather ? "Getting your local weather…" : displaySuggestion}
          </Text>
          {!isLive && !isLoadingWeather && onWeatherCardPress && (
            <Text style={styles.tapHint}>Tap to use your location ↗</Text>
          )}
        </Card>
      </TouchableOpacity>

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

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildSuggestion(condition: string, tempC: number): string {
  if (condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("shower")) {
    return "Carry an umbrella and wear water-resistant layers today.";
  }
  if (condition.toLowerCase().includes("snow")) {
    return "Bundle up — snow expected. Heavy layers recommended.";
  }
  if (condition.toLowerCase().includes("thunder")) {
    return "Stay indoors if possible. Stormy conditions expected.";
  }
  if (tempC >= 30) return "It's hot! Light, breathable fabrics recommended.";
  if (tempC >= 22) return "Warm and pleasant. Light outerwear optional.";
  if (tempC >= 15) return "Mild weather. A light jacket should do.";
  if (tempC >= 8)  return "Cool outside. Layer up with a sweater or coat.";
  return "Cold conditions. Wear warm, insulating layers today.";
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  loadingSpinner: {
    marginRight: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
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
  tapHint: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: "italic",
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
