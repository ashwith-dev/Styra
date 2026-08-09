import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
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
          <Ionicons name="thermometer-outline" size={22} color={colors.textPrimary} style={styles.icon} />
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
    backgroundColor: "#F7F5F0",
    borderRadius: 22,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
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
