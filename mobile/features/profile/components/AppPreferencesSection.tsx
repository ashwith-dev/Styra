import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/theme";

interface AppPreferencesSectionProps {
  temperatureUnit: "Celsius (°C)" | "Fahrenheit (°F)";
  onEditTemperature: () => void;
}

export function AppPreferencesSection({
  temperatureUnit,
  onEditTemperature,
}: AppPreferencesSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeaderLabel}>APP PREFERENCES</Text>

      <TouchableOpacity
        onPress={onEditTemperature}
        style={styles.card}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Edit Temperature Unit"
      >
        <View style={styles.leftRow}>
          <Ionicons name="thermometer-outline" size={22} color="#1A1A1A" style={styles.icon} />
          <Text style={styles.titleText}>Temperature Unit</Text>
        </View>

        <View style={styles.rightRow}>
          <Text style={styles.valueText}>{temperatureUnit}</Text>
          <Ionicons name="chevron-down" size={16} color="#7F7C76" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  sectionHeaderLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  icon: {
    marginRight: 4,
  },
  titleText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  valueText: {
    ...typography.body,
    fontSize: 14,
    color: "#7F7C76",
  },
});
