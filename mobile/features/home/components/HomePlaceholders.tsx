import { Platform, ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography } from "@/theme";
import { homeTokens, neumorphicStyles } from "../theme/homeTokens";
import type { HomePlaceholdersProps } from "../types";

export function HomePlaceholders({
  weather,
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
      {/* Weather Card — Neumorphic Soft Raised Panel */}
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
        style={styles.card}
      >
        <View style={styles.rowBetween}>
          <View style={styles.weatherLeft}>
            {isLoadingWeather ? (
              <ActivityIndicator
                size="small"
                color={homeTokens.textPrimary}
                style={styles.loadingSpinner}
              />
            ) : (
              <Ionicons
                name={displayIcon as React.ComponentProps<typeof Ionicons>["name"]}
                size={22}
                color={homeTokens.textPrimary}
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
            <View style={styles.neumorphicBadge}>
              <Text style={styles.badgeText}>● WEATHER</Text>
            </View>
          </View>
        </View>

        <Text style={styles.suggestionText}>
          {isLoadingWeather ? "Getting your local weather…" : displaySuggestion}
        </Text>

        {!isLive && !isLoadingWeather && onWeatherCardPress && (
          <Text style={styles.tapHint}>Tap to use your location ↗</Text>
        )}
      </TouchableOpacity>
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
    ...neumorphicStyles.subtle,
    borderRadius: 24,
    padding: spacing.lg,
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
    backgroundColor: "#3F7D58",
  },
  neumorphicBadge: {
    backgroundColor: homeTokens.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: homeTokens.textSecondary,
  },
  tempText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 22,
    fontWeight: "700",
    color: homeTokens.textPrimary,
  },
  conditionText: {
    ...typography.caption,
    fontSize: 13,
    color: homeTokens.textSecondary,
    marginLeft: spacing.xxs,
  },
  suggestionText: {
    ...typography.caption,
    fontSize: 13,
    color: "#666460",
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  tapHint: {
    ...typography.caption,
    fontSize: 11,
    color: homeTokens.textSecondary,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
});
