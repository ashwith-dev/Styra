import { Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
import type { UserPreferences } from "../types/profile";
import { formatPreferenceLabel, resolveColorHex } from "../utils/preferenceUtils";

interface AiStyleProfileSectionProps {
  preferences: UserPreferences;
  onEditSection: (sectionKey: string) => void;
  onToggleNotification: (enabled: boolean) => void;
}

export function AiStyleProfileSection({
  preferences,
  onEditSection,
  onToggleNotification,
}: AiStyleProfileSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeaderLabel}>AI STYLE PROFILE</Text>

      {/* 1. Preferred Styles Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>PREFERRED STYLES</Text>
          <TouchableOpacity
            onPress={() => onEditSection("styles")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Edit Preferred Styles"
          >
            <Ionicons name="pencil" size={16} color="#7F7C76" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => onEditSection("styles")}
          activeOpacity={0.8}
          style={styles.chipsRow}
        >
          {preferences.styles && preferences.styles.length > 0 ? (
            preferences.styles.map((style, idx) => (
              <View key={idx} style={styles.chip}>
                <Text style={styles.chipText}>{formatPreferenceLabel(style, "style")}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyChip}>
              <Text style={styles.emptyChipText}>+ Select preferred styles</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 2. Favourite Colours Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>FAVOURITE COLOURS</Text>
          <TouchableOpacity
            onPress={() => onEditSection("favoriteColors")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Edit Favourite Colours"
          >
            <Ionicons name="pencil" size={16} color="#7F7C76" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => onEditSection("favoriteColors")}
          activeOpacity={0.8}
          style={styles.colorsRow}
        >
          {preferences.favoriteColors && preferences.favoriteColors.length > 0 ? (
            preferences.favoriteColors.map((colorInput, idx) => {
              const hex = resolveColorHex(colorInput);
              const isWhiteOrLight =
                hex.toUpperCase() === "#FFFFFF" ||
                hex.toUpperCase() === "#FAF9F6" ||
                hex.toUpperCase() === "#F8F9FA" ||
                hex.toUpperCase() === "#FFFDD0" ||
                hex.toUpperCase() === "#FFFFF0";
              return (
                <View
                  key={idx}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: hex },
                    isWhiteOrLight && styles.whiteColorCircleBorder,
                  ]}
                />
              );
            })
          ) : (
            <View style={styles.emptyChip}>
              <Text style={styles.emptyChipText}>+ Select favourite colours</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 3. Fit Preference Card */}
      <TouchableOpacity
        onPress={() => onEditSection("fitPreference")}
        style={styles.card}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>FIT PREFERENCE</Text>
          <Ionicons name="pencil" size={16} color="#7F7C76" />
        </View>

        <Text
          style={[
            styles.valueHeadline,
            !preferences.fitPreference && styles.unselectedText,
          ]}
        >
          {preferences.fitPreference
            ? formatPreferenceLabel(preferences.fitPreference, "fit")
            : "Not Selected"}
        </Text>
      </TouchableOpacity>

      {/* 4. Lifestyle Card */}
      <TouchableOpacity
        onPress={() => onEditSection("lifestyle")}
        style={styles.card}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>LIFESTYLE</Text>
          <Ionicons name="pencil" size={16} color="#7F7C76" />
        </View>

        <Text
          style={[
            styles.valueHeadline,
            !preferences.lifestyle && styles.unselectedText,
          ]}
        >
          {preferences.lifestyle
            ? formatPreferenceLabel(preferences.lifestyle, "lifestyle")
            : "Not Selected"}
        </Text>
      </TouchableOpacity>

      {/* 5. Smart Notifications Card */}
      <View style={styles.card}>
        <View style={styles.notifRow}>
          <View style={styles.notifLeft}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color="#1A1A1A"
              style={styles.notifIcon}
            />
            <View>
              <Text style={styles.cardTitle}>SMART NOTIFICATIONS</Text>
              <Text style={styles.notifSubhead}>Daily Outfit Suggestions</Text>
            </View>
          </View>

          <Switch
            value={preferences.smartNotifications}
            onValueChange={onToggleNotification}
            trackColor={{ false: "#E0DDD5", true: "#000000" }}
            thumbColor={colors.surface}
          />
        </View>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
    textTransform: "uppercase",
  },
  chipsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
    marginTop: spacing.xs,
  },
  chip: {
    backgroundColor: "#F4F1EA",
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  chipText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  emptyChip: {
    backgroundColor: "#F8F6F0",
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: "#E5E1D8",
    borderStyle: "dashed",
  },
  emptyChipText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: "500",
    color: "#7F7C76",
  },
  colorsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  whiteColorCircleBorder: {
    borderWidth: 1,
    borderColor: "#DCD8CE",
  },
  valueHeadline: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 4,
  },
  unselectedText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 18,
    fontWeight: "400",
    fontStyle: "italic",
    color: "#A09C94",
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notifLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  notifIcon: {
    marginRight: 2,
  },
  notifSubhead: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 2,
  },
});
