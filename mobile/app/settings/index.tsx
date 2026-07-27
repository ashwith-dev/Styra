import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
} from "react-native";
import Constants from "expo-constants";
import { useAuth } from "../../providers/AuthProvider";
import { colors, fontSize, fontWeight, spacing } from "../../lib/theme";

// ── Reusable row components ──

function SettingsRow({
  label,
  value,
  onPress,
  disabled,
  placeholder,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
  placeholder?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={disabled || placeholder}
      activeOpacity={placeholder ? 1 : 0.6}
    >
      <Text style={[styles.rowLabel, placeholder && styles.placeholderText]}>
        {label}
        {placeholder && " — coming soon"}
      </Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {!placeholder && (
          <Text style={styles.rowArrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function SettingsSwitchRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

// ── Screen ──

export default function SettingsScreen() {
  const { signOut } = useAuth();

  // Notification toggles (local state only — no backend)
  const [notifOutfits, setNotifOutfits] = useState(false);
  const [notifWardrobe, setNotifWardrobe] = useState(false);
  const [notifGeneral, setNotifGeneral] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? "0.1.0";

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Account deletion is not yet available. Please contact support.",
      [{ text: "OK" }],
    );
  };

  const handlePlaceholder = () => {
    Alert.alert("Coming Soon", "This feature will be available in a future update.");
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://example.com/privacy");
  };

  const handleTerms = () => {
    Linking.openURL("https://example.com/terms");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.heading}>Settings</Text>

      {/* Notifications */}
      <SettingsSection title="Notifications">
        <SettingsSwitchRow
          label="Outfit Recommendations"
          value={notifOutfits}
          onValueChange={setNotifOutfits}
        />
        <View style={styles.divider} />
        <SettingsSwitchRow
          label="Wardrobe Reminders"
          value={notifWardrobe}
          onValueChange={setNotifWardrobe}
        />
        <View style={styles.divider} />
        <SettingsSwitchRow
          label="General"
          value={notifGeneral}
          onValueChange={setNotifGeneral}
        />
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection title="Preferences">
        <SettingsRow
          label="Units"
          placeholder
          onPress={handlePlaceholder}
        />
        <View style={styles.divider} />
        <SettingsRow
          label="Theme"
          placeholder
          onPress={handlePlaceholder}
        />
        <View style={styles.divider} />
        <SettingsRow
          label="Language"
          placeholder
          onPress={handlePlaceholder}
        />
      </SettingsSection>

      {/* Privacy & Security */}
      <SettingsSection title="Privacy & Security">
        <SettingsRow
          label="Privacy Policy"
          onPress={handlePrivacyPolicy}
        />
        <View style={styles.divider} />
        <SettingsRow
          label="Terms & Conditions"
          onPress={handleTerms}
        />
        <View style={styles.divider} />
        <SettingsRow
          label="Delete Account"
          placeholder
          onPress={handleDeleteAccount}
        />
        <View style={styles.divider} />
        <SettingsRow
          label="Sign Out"
          onPress={signOut}
        />
      </SettingsSection>

      {/* Support */}
      <SettingsSection title="Support">
        <SettingsRow
          label="Help & FAQ"
          placeholder
          onPress={handlePlaceholder}
        />
        <View style={styles.divider} />
        <SettingsRow
          label="Contact Support"
          placeholder
          onPress={handlePlaceholder}
        />
        <View style={styles.divider} />
        <SettingsRow
          label="Send Feedback"
          placeholder
          onPress={handlePlaceholder}
        />
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About">
        <SettingsRow label="App Version" value={appVersion} />
        <View style={styles.divider} />
        <SettingsRow
          label="Build Number"
          placeholder
        />
      </SettingsSection>
    </ScrollView>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 60,
    paddingBottom: spacing.xxl,
  },
  heading: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  sectionBody: {
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  rowLabel: {
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  rowValue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  rowArrow: {
    fontSize: 22,
    color: colors.textTertiary,
    lineHeight: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginLeft: spacing.xl,
  },
  placeholderText: {
    color: colors.textTertiary,
  },
});
