import {
  Linking,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
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
                      trackColor={{ false: "#E5E1D8", true: "#141412" }}
                      thumbColor="#FFFFFF"
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
                  <Ionicons name="chevron-forward" size={18} color="#7F7C76" />
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

      {/* Sign Out Section */}
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
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: spacing.xs + 2,
  },
  sectionBody: {
    backgroundColor: "#F7F5F0",
    borderRadius: 22,
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    overflow: "hidden",
  } as ViewStyle & { boxShadow?: string },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
    minHeight: 52,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  rowLabel: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: "#7F7C76",
  },
  rowValue: {
    ...typography.caption,
    fontSize: 14,
    color: "#7F7C76",
    textTransform: "capitalize",
  },
  signOutText: {
    color: colors.error,
    fontWeight: "600",
  },
});
