import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import {
  BottomNavBar,
  DeleteAccountModal,
  SignOutModal,
} from "@/components/ui";
import { colors, radius, spacing, typography } from "@/theme";
import {
  EditProfileModal,
  EXTERNAL_LINKS,
  useProfileData,
} from "@/features/profile";
import {
  ContactSupportModal,
  HelpCenterModal,
  PrivacyModal,
  RateStyraModal,
  SendFeedbackModal,
  SettingsProfileHeroCard,
  SettingsRow,
  SettingsSectionCard,
  TermsConditionsModal,
} from "@/features/settings";
import { deleteUserAccount } from "@/lib/services/accountService";
import { clearDataCaches, getCacheSizeBytes } from "@/lib/storage/clearAll";
import { supabase } from "@/lib/supabase";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SettingsScreen() {
  const { user, actions } = useProfileData();

  // Modals state
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [helpCenterModalVisible, setHelpCenterModalVisible] = useState(false);
  const [contactSupportModalVisible, setContactSupportModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);

  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone ?? "");
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatarUrl ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [cacheSizeLabel, setCacheSizeLabel] = useState("…");

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  useEffect(() => {
    void getCacheSizeBytes().then((b) => setCacheSizeLabel(formatBytes(b)));
  }, []);

  // Handle Edit Profile save
  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    const success = await actions.updateProfile({
      name: editName,
      phone: editPhone,
      avatarUrl: editAvatarUrl,
    });
    setSavingProfile(false);
    if (success) {
      setEditProfileVisible(false);
    }
  }, [editName, editPhone, editAvatarUrl, actions]);

  // Sign Out Handler (Confirmed from Custom Modal)
  const handleConfirmSignOut = useCallback(async () => {
    setSignOutModalVisible(false);
    await actions.signOut();
    router.replace("/auth/sign-in");
  }, [actions]);

  // Delete Account Handler (Confirmed from Custom Modal)
  const handleConfirmDeleteAccount = useCallback(async () => {
    setDeleteAccountModalVisible(false);
    const userId = user.id;

    if (!userId) {
      Alert.alert("Error", "Could not verify your account. Please sign in again.");
      return;
    }

    try {
      await deleteUserAccount(userId);
      router.replace("/auth/sign-in");
    } catch {
      Alert.alert(
        "Delete Failed",
        "We couldn't delete your account. Check your connection and try again.",
      );
    }
  }, [user.id]);

  // Open External URLs safely
  const handleOpenUrl = useCallback((url: string) => {
    void Linking.openURL(url).catch(() => {
      Alert.alert("Notice", "Unable to open link.");
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Back to Profile"
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Hero Card */}
          <SettingsProfileHeroCard
            user={user}
            onPress={() => {
              setEditName(user.name);
              setEditPhone(user.phone ?? "");
              setEditAvatarUrl(user.avatarUrl ?? "");
              setEditProfileVisible(true);
            }}
          />

          {/* ACCOUNT Section */}
          <SettingsSectionCard title="ACCOUNT">
            <SettingsRow
              iconName="person-outline"
              title="Personal Information"
              isLast
              onPress={() => {
                setEditName(user.name);
                setEditPhone(user.phone ?? "");
                setEditAvatarUrl(user.avatarUrl ?? "");
                setEditProfileVisible(true);
              }}
            />
          </SettingsSectionCard>

          {/* PRIVACY Section */}
          <SettingsSectionCard title="PRIVACY & DATA">
            <SettingsRow
              iconName="eye-outline"
              title="Privacy"
              isLast
              onPress={() => setPrivacyModalVisible(true)}
            />
          </SettingsSectionCard>

          {/* SUPPORT Section */}
          <SettingsSectionCard title="SUPPORT">
            <SettingsRow
              iconName="help-circle-outline"
              title="Help Centre"
              onPress={() => setHelpCenterModalVisible(true)}
            />
            <SettingsRow
              iconName="mail-outline"
              title="Contact Support"
              onPress={() => setContactSupportModalVisible(true)}
            />
            <SettingsRow
              iconName="chatbubble-outline"
              title="Send Feedback"
              onPress={() => setFeedbackModalVisible(true)}
            />
            <SettingsRow
              iconName="star-outline"
              title="Rate STYRA"
              isLast
              onPress={() => setRateModalVisible(true)}
            />
          </SettingsSectionCard>

          {/* LEGAL Section */}
          <SettingsSectionCard title="LEGAL">
            <SettingsRow
              iconName="document-text-outline"
              title="Terms & Conditions"
              onPress={() => setTermsModalVisible(true)}
            />
            <SettingsRow
              iconName="shield-checkmark-outline"
              title="Privacy Policy"
              isLast
              onPress={() => setPrivacyModalVisible(true)}
            />
          </SettingsSectionCard>

          {/* Action Buttons: Sign Out & Delete Account */}
          <View style={styles.actionsGroup}>
            <TouchableOpacity
              onPress={() => setSignOutModalVisible(true)}
              style={styles.signOutBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Sign Out"
            >
              <Text style={styles.signOutBtnText}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDeleteAccountModalVisible(true)}
              style={styles.deleteAccountBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Delete Account"
            >
              <Text style={styles.deleteAccountBtnText}>Delete Account</Text>
            </TouchableOpacity>
          </View>

          {/* APP VERSION Footer */}
          <Text style={styles.versionText}>
            STYRA VERSION {appVersion} (BUILD 102)
          </Text>
        </ScrollView>

        {/* Floating Bottom Navigation Bar */}
        <BottomNavBar activeTab="profile" />
      </View>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editProfileVisible}
        name={editName}
        email={user.email}
        phone={editPhone}
        avatarUrl={editAvatarUrl}
        saving={savingProfile}
        onChangeName={setEditName}
        onChangePhone={setEditPhone}
        onChangeAvatarUrl={setEditAvatarUrl}
        onSave={handleSaveProfile}
        onClose={() => setEditProfileVisible(false)}
      />

      {/* Privacy & Data Security Modal */}
      <PrivacyModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
      />

      {/* Help Centre Modal */}
      <HelpCenterModal
        visible={helpCenterModalVisible}
        onClose={() => setHelpCenterModalVisible(false)}
      />

      {/* Contact Support Modal */}
      <ContactSupportModal
        visible={contactSupportModalVisible}
        onClose={() => setContactSupportModalVisible(false)}
      />

      {/* Send Feedback Modal */}
      <SendFeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
      />

      {/* Rate STYRA Modal */}
      <RateStyraModal
        visible={rateModalVisible}
        onClose={() => setRateModalVisible(false)}
      />

      {/* Terms & Conditions Modal */}
      <TermsConditionsModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
      />

      {/* Custom Blurred Backdrop Sign Out Modal */}
      <SignOutModal
        visible={signOutModalVisible}
        onConfirm={handleConfirmSignOut}
        onClose={() => setSignOutModalVisible(false)}
      />

      {/* Custom Blurred Backdrop Delete Account Modal */}
      <DeleteAccountModal
        visible={deleteAccountModalVisible}
        onConfirm={handleConfirmDeleteAccount}
        onClose={() => setDeleteAccountModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EFECE6",
  },
  headerTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 120,
  },
  actionsGroup: {
    gap: spacing.md,
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  signOutBtn: {
    backgroundColor: "#F7F5F0",
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 0,
    boxShadow: "-6px -6px 16px #FFFFFF, 6px 6px 16px rgba(185, 175, 158, 0.65)",
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  } as ViewStyle & { boxShadow?: string },
  signOutBtnText: {
    ...typography.button,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  deleteAccountBtn: {
    backgroundColor: "#F7F5F0",
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 0,
    boxShadow: "-4px -4px 10px #FFFFFF, 4px 4px 10px rgba(211, 47, 47, 0.15)",
    shadowColor: "#D32F2F",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle & { boxShadow?: string },
  deleteAccountBtnText: {
    ...typography.button,
    fontSize: 15,
    fontWeight: "600",
    color: "#D32F2F",
  },
  versionText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#A09C94",
    textAlign: "center",
    marginBottom: spacing.md,
  },
});
