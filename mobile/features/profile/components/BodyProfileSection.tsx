import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/theme";
import type { BodyProfile } from "../types/profile";

interface BodyProfileSectionProps {
  bodyProfile: BodyProfile;
  onEditField: (fieldKey: keyof BodyProfile) => void;
}

const formatVal = (raw: string | string[] | undefined): string => {
  if (Array.isArray(raw)) return raw.join(", ");
  return raw || "";
};

export function BodyProfileSection({
  bodyProfile,
  onEditField,
}: BodyProfileSectionProps) {
  const fields: { key: keyof BodyProfile; label: string; value: string; hasDropdown?: boolean }[] = [
    { key: "height", label: "HEIGHT", value: formatVal(bodyProfile.height) },
    { key: "weight", label: "WEIGHT", value: formatVal(bodyProfile.weight) },
    { key: "topSize", label: "TOP SIZE", value: formatVal(bodyProfile.topSize), hasDropdown: true },
    { key: "bottomSize", label: "BOTTOM SIZE", value: formatVal(bodyProfile.bottomSize), hasDropdown: true },
    { key: "shoeSize", label: "SHOE SIZE", value: formatVal(bodyProfile.shoeSize), hasDropdown: true },
    { key: "gender", label: "GENDER", value: formatVal(bodyProfile.gender) },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeaderLabel}>BODY PROFILE</Text>

      <View style={styles.grid}>
        {fields.map((field) => {
          const displayVal = field.value ? field.value : "Not Set";
          const isNotSet = !field.value;

          return (
            <TouchableOpacity
              key={field.key}
              onPress={() => onEditField(field.key)}
              style={styles.card}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${field.label}`}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{field.label}</Text>
                <Ionicons name="pencil" size={14} color="#7F7C76" />
              </View>

              <View style={styles.valueRow}>
                <Text style={[styles.valueText, isNotSet && styles.notSetText]} numberOfLines={1}>
                  {displayVal}
                </Text>
                {field.hasDropdown && (
                  <Ionicons name="chevron-down" size={16} color="#7F7C76" style={styles.dropdownIcon} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  card: {
    width: "47.5%",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#7F7C76",
    textTransform: "uppercase",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  notSetText: {
    fontSize: 15,
    fontWeight: "400",
    fontStyle: "italic",
    color: "#A09C94",
  },
  dropdownIcon: {
    marginLeft: 4,
  },
});
