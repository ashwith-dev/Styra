/**
 * Outfit configuration selector — bottom sheet for occasion, style, weather.
 *
 * Premium editorial design with serif headings and smooth transitions.
 */

import { useCallback, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography } from "@/theme";
import { useLocationWeather } from "@/hooks/useLocationWeather";

interface OutfitConfigSheetProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (params: {
    occasion: string;
    style: string;
    weather?: { temperature?: number; condition?: string };
  }) => void;
}

const OCCASIONS = [
  { key: "casual", label: "Casual", icon: "shirt-outline" as const },
  { key: "formal", label: "Formal", icon: "ribbon-outline" as const },
  { key: "office", label: "Office", icon: "briefcase-outline" as const },
  { key: "college", label: "College", icon: "school-outline" as const },
  { key: "party", label: "Party", icon: "sparkles-outline" as const },
  { key: "date_night", label: "Date", icon: "heart-outline" as const },
  { key: "travel", label: "Travel", icon: "airplane-outline" as const },
  { key: "gym", label: "Gym", icon: "fitness-outline" as const },
];

const STYLES = [
  { key: "casual", label: "Casual" },
  { key: "minimalist", label: "Minimalist" },
  { key: "formal", label: "Formal" },
  { key: "sporty", label: "Sporty" },
  { key: "streetwear", label: "Streetwear" },
  { key: "preppy", label: "Preppy" },
  { key: "bohemian", label: "Bohemian" },
  { key: "vintage", label: "Vintage" },
];

const WEATHER_PRESETS = [
  {
    key: "sunny",
    label: "Sunny",
    icon: "sunny-outline" as const,
    weather: { temperature: 30, condition: "Sunny" },
  },
  {
    key: "warm",
    label: "Warm",
    icon: "partly-sunny-outline" as const,
    weather: { temperature: 22, condition: "Clear" },
  },
  {
    key: "cool",
    label: "Cool",
    icon: "cloud-outline" as const,
    weather: { temperature: 15, condition: "Cool" },
  },
  {
    key: "cold",
    label: "Cold",
    icon: "snow-outline" as const,
    weather: { temperature: 5, condition: "Cold" },
  },
  {
    key: "rainy",
    label: "Rainy",
    icon: "rainy-outline" as const,
    weather: { temperature: 18, condition: "Rainy" },
  },
  {
    key: "any",
    label: "Any",
    icon: "options-outline" as const,
    weather: undefined,
  },
];

export function OutfitConfigSheet({
  visible,
  onClose,
  onGenerate,
}: OutfitConfigSheetProps) {
  const [selectedOccasion, setSelectedOccasion] = useState<string>("casual");
  const [selectedStyle, setSelectedStyle] = useState<string>("casual");
  const [selectedWeatherKey, setSelectedWeatherKey] = useState<string>("auto");
  const { weatherData, locationStatus } = useLocationWeather();

  const isAutoAvailable = !!(weatherData && locationStatus === "success");

  // Effective weather key: fallback to "any" if "auto" is selected but location weather is not available
  const activeWeatherKey =
    selectedWeatherKey === "auto" && !isAutoAvailable
      ? "any"
      : selectedWeatherKey;

  const handleGenerate = useCallback(() => {
    let weather: { temperature?: number; condition?: string } | undefined;

    if (activeWeatherKey === "auto" && isAutoAvailable && weatherData) {
      weather = {
        temperature: weatherData.temperatureCelsius,
        condition: weatherData.condition,
      };
    } else {
      const preset = WEATHER_PRESETS.find((w) => w.key === activeWeatherKey);
      weather = preset?.weather;
    }

    onGenerate({ occasion: selectedOccasion, style: selectedStyle, weather });
  }, [
    selectedOccasion,
    selectedStyle,
    activeWeatherKey,
    isAutoAvailable,
    weatherData,
    onGenerate,
  ]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Create Outfit</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Occasion */}
          <Text style={styles.sectionLabel}>OCCASION</Text>
          <View style={styles.chipGrid}>
            {OCCASIONS.map((occ) => (
              <TouchableOpacity
                key={occ.key}
                style={[
                  styles.chip,
                  selectedOccasion === occ.key && styles.chipSelected,
                ]}
                onPress={() => setSelectedOccasion(occ.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={occ.icon}
                  size={18}
                  color={
                    selectedOccasion === occ.key
                      ? colors.surface
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.chipText,
                    selectedOccasion === occ.key && styles.chipTextSelected,
                  ]}
                >
                  {occ.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Style */}
          <Text style={styles.sectionLabel}>STYLE</Text>
          <View style={styles.chipGrid}>
            {STYLES.map((sty) => (
              <TouchableOpacity
                key={sty.key}
                style={[
                  styles.chip,
                  styles.styleChip,
                  selectedStyle === sty.key && styles.chipSelected,
                ]}
                onPress={() => setSelectedStyle(sty.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedStyle === sty.key && styles.chipTextSelected,
                  ]}
                >
                  {sty.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Weather */}
          <Text style={styles.sectionLabel}>WEATHER</Text>
          {!isAutoAvailable && (
            <Text style={styles.weatherHint}>
              Location off — select weather manually
            </Text>
          )}
          <View style={styles.chipGrid}>
            {/* Auto-detected chip if location weather is available */}
            {isAutoAvailable && weatherData && (
              <TouchableOpacity
                style={[
                  styles.chip,
                  activeWeatherKey === "auto" && styles.chipSelected,
                ]}
                onPress={() => setSelectedWeatherKey("auto")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={
                    activeWeatherKey === "auto"
                      ? colors.surface
                      : colors.accent
                  }
                />
                <Text
                  style={[
                    styles.chipText,
                    activeWeatherKey === "auto" && styles.chipTextSelected,
                  ]}
                >
                  Auto ({weatherData.temperatureCelsius}° {weatherData.condition})
                </Text>
              </TouchableOpacity>
            )}

            {/* Manual Weather Presets */}
            {WEATHER_PRESETS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.chip,
                  activeWeatherKey === item.key && styles.chipSelected,
                ]}
                onPress={() => setSelectedWeatherKey(item.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={
                    activeWeatherKey === item.key
                      ? colors.surface
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.chipText,
                    activeWeatherKey === item.key && styles.chipTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerate}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={20} color={colors.surface} />
            <Text style={styles.generateButtonText}>Generate Outfit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  styleChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.surface,
  },
  weatherCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  weatherText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  weatherPlaceholder: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  weatherHint: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
  },
  generateButtonText: {
    ...typography.button,
    color: colors.surface,
  },
});
