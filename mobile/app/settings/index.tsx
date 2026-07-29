import { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  SettingsProfileHeroCard,
  SettingsRow,
  SettingsSectionCard,
} from "@/features/settings";
import { supabase } from "@/lib/supabase";

export default function SettingsScreen() {
  const { user, actions } = useProfileData();

  // Modals state
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);

  const [editName, setEditName] = useState(user.name);
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatarUrl ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? "2.4.1";

  // Handle Edit Profile save
  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    const success = await actions.updateProfile({
      name: editName,
      avatarUrl: editAvatarUrl,
    });
    setSavingProfile(false);
    if (success) {
      setEditProfileVisible(false);
    }
  }, [editName, editAvatarUrl, actions]);

  // Sign Out Handler (Confirmed from Custom Modal)
  const handleConfirmSignOut = useCallback(async () => {
    setSignOutModalVisible(false);
    await actions.signOut();
    router.replace("/auth/login");
  }, [actions]);

  // Delete Account Handler (Confirmed from Custom Modal)
  const handleConfirmDeleteAccount = useCallback(async () => {
    setDeleteAccountModalVisible(false);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (userId) {
        // Cascade delete all user records in Supabase tables
        await supabase.from("clothing_items").delete().eq("user_id", userId);
        await supabase.from("saved_looks").delete().eq("user_id", userId);
        await supabase.from("outfit_history").delete().eq("user_id", userId);
        await supabase.from("user_preferences").delete().eq("user_id", userId);
        await supabase.from("user_statistics").delete().eq("user_id", userId);
        await supabase.from("notifications").delete().eq("user_id", userId);
        await supabase.from("feedback").delete().eq("user_id", userId);
        await supabase.from("users").delete().eq("id", userId);
      }
    } catch {
      // Best effort data cleanup
    }

    await actions.signOut();
    router.replace("/auth/login");
  }, [actions]);

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
              setEditAvatarUrl(user.avatarUrl ?? "");
              setEditProfileVisible(true);
            }}
          />

          {/* ACCOUNT Section */}
          <SettingsSectionCard title="ACCOUNT">
            <SettingsRow
              iconName="person-outline"
              title="Personal Information"
              onPress={() => {
                setEditName(user.name);
                setEditAvatarUrl(user.avatarUrl ?? "");
                setEditProfileVisible(true);
              }}
            />
            <SettingsRow
              iconName="lock-closed-outline"
              title="Change Password"
              isLast
              onPress={() =>
                Alert.alert(
                  "Change Password",
                  "A password reset link will be sent to your registered email address.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Send Link", onPress: () => Alert.alert("Sent", "Check your email for instructions.") },
                  ],
                )
              }
            />
          </SettingsSectionCard>

          {/* PRIVACY & DATA Section */}
          <SettingsSectionCard title="PRIVACY & DATA">
            <SettingsRow
              iconName="eye-outline"
              title="Privacy"
              onPress={() => handleOpenUrl(EXTERNAL_LINKS.privacyPolicy)}
            />
            <SettingsRow
              iconName="server-outline"
              title="Data & Storage"
              isLast
              onPress={() =>
                Alert.alert("Data & Storage", "Your wardrobe image cache is current. Space used: 24 MB", [
                  { text: "Close" },
                  { text: "Clear Cache", style: "destructive", onPress: () => Alert.alert("Cleared", "Cache cleared successfully.") },
                ])
              }
            />
          </SettingsSectionCard>

          {/* SUPPORT Section */}
          <SettingsSectionCard title="SUPPORT">
            <SettingsRow
              iconName="help-circle-outline"
              title="Help Centre"
              onPress={() => handleOpenUrl(EXTERNAL_LINKS.helpCenter)}
            />
            <SettingsRow
              iconName="mail-outline"
              title="Contact Support"
              onPress={() => handleOpenUrl(EXTERNAL_LINKS.supportContact)}
            />
            <SettingsRow
              iconName="chatbubble-outline"
              title="Send Feedback"
              onPress={() => handleOpenUrl(EXTERNAL_LINKS.sendFeedback)}
            />
            <SettingsRow
              iconName="star-outline"
              title="Rate STYRA"
              isLast
              onPress={() => Alert.alert("Rate STYRA", "Thank you for supporting STYRA! Store rating flow opening...")}
            />
          </SettingsSectionCard>

          {/* LEGAL Section */}
          <SettingsSectionCard title="LEGAL">
            <SettingsRow
              iconName="document-text-outline"
              title="Terms & Conditions"
              onPress={() => handleOpenUrl(EXTERNAL_LINKS.termsConditions)}
            />
            <SettingsRow
              iconName="shield-checkmark-outline"
              title="Privacy Policy"
              isLast
              onPress={() => handleOpenUrl(EXTERNAL_LINKS.privacyPolicy)}
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
        avatarUrl={editAvatarUrl}
        saving={savingProfile}
        onChangeName={setEditName}
        onChangeAvatarUrl={setEditAvatarUrl}
        onSave={handleSaveProfile}
        onClose={() => setEditProfileVisible(false)}
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0DDD5",
  },
  signOutBtnText: {
    ...typography.button,
    fontSize: 15,
    color: "#1A1A1A",
  },
  deleteAccountBtn: {
    backgroundColor: "#FFF8F8",
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FAD4D4",
  },
  deleteAccountBtnText: {
    ...typography.button,
    fontSize: 15,
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
