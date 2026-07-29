import {
  Linking,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/theme";
import type {
  SettingsSectionConfig,
  UserPreferences,
} from "../types/profile";

interface SettingsSectionListProps {
  sections: SettingsSectionConfig[];
  preferences: UserPreferences;
  onToggleNotification: (
    key: keyof UserPreferences["notifications"],
    value: boolean,
  ) => void;
  appVersion: string;
  onSignOut: () => void;
}

export function SettingsSectionList({
  sections,
  preferences,
  onToggleNotification,
  appVersion,
  onSignOut,
}: SettingsSectionListProps) {
  const handleLinkPress = (url?: string) => {
    if (url) {
      void Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionBody}>
            {section.items.map((item, idx) => {
              const isLast = idx === section.items.length - 1;

              if (item.type === "toggle" && item.valueKey) {
                const checked =
                  preferences.notifications[
                    item.valueKey as keyof UserPreferences["notifications"]
                  ] ?? false;

                return (
                  <View key={item.key} style={[styles.row, !isLast && styles.rowBorder]}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    <Switch
                      value={checked}
                      onValueChange={(val) =>
                        onToggleNotification(
                          item.valueKey as keyof UserPreferences["notifications"],
                          val,
                        )
                      }
                      trackColor={{ false: colors.border, true: colors.textPrimary }}
                      thumbColor="#ffffff"
                      accessibilityRole="switch"
                      accessibilityLabel={item.label}
                    />
                  </View>
                );
              }

              if (item.type === "value" && item.valueKey) {
                const val = preferences[item.valueKey as keyof UserPreferences];
                const displayVal = typeof val === "string" ? val : item.label;

                return (
                  <View key={item.key} style={[styles.row, !isLast && styles.rowBorder]}>
                    <Text style={[styles.rowLabel, item.placeholder && styles.placeholderText]}>
                      {item.label}
                      {item.placeholder ? " (Coming Soon)" : ""}
                    </Text>
                    <Text style={styles.rowValue}>{String(displayVal)}</Text>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.row, !isLast && styles.rowBorder]}
                  onPress={() => handleLinkPress(item.linkUrl)}
                  activeOpacity={0.7}
                  accessibilityRole="link"
                  accessibilityLabel={item.label}
                >
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {/* About App Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.sectionBody}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>App Version</Text>
            <Text style={styles.rowValue}>{appVersion}</Text>
          </View>
        </View>
      </View>

      {/* Sign Out Row */}
      <View style={styles.section}>
        <View style={styles.sectionBody}>
          <TouchableOpacity
            style={styles.row}
            onPress={onSignOut}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            testID="settings-sign-out-btn"
          >
            <Text style={[styles.rowLabel, styles.signOutText]}>Sign Out</Text>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  section: {},
  sectionTitle: {
    ...typography.label,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  sectionBody: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 48,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: "capitalize",
  },
  signOutText: {
    color: colors.error,
    fontWeight: "600",
  },
});
