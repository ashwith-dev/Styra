import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { colors, spacing, typography } from "@/theme";
import {
  EditProfileModal,
  ProfileHeaderCard,
  ProfileStatsRow,
  SETTINGS_SECTIONS,
  SettingsSectionList,
  useProfileData,
} from "@/features/profile";
import type { UserPreferences } from "@/features/profile";

export default function ProfileScreen() {
  const { user, preferences, stats, preferenceState, error, actions } =
    useProfileData();

  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatarUrl ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const handleOpenEdit = useCallback(() => {
    setEditName(user.name);
    setEditAvatarUrl(user.avatarUrl ?? "");
    setModalVisible(true);
  }, [user.name, user.avatarUrl]);

  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    const success = await actions.updateProfile({
      name: editName,
      avatarUrl: editAvatarUrl,
    });
    setSavingProfile(false);
    if (success) {
      setModalVisible(false);
    }
  }, [editName, editAvatarUrl, actions]);

  const handleToggleNotification = useCallback(
    (key: keyof UserPreferences["notifications"], val: boolean) => {
      void actions.updatePreferences({
        notifications: {
          ...preferences.notifications,
          [key]: val,
        },
      });
    },
    [preferences.notifications, actions],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">
          Profile & Settings
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <ProfileHeaderCard user={user} onEditProfile={handleOpenEdit} />

        {/* Wardrobe & Looks Stats Breakdown */}
        <ProfileStatsRow stats={stats} />

        {/* Data-Driven Settings Sections List */}
        <SettingsSectionList
          sections={SETTINGS_SECTIONS}
          preferences={preferences}
          onToggleNotification={handleToggleNotification}
          appVersion={appVersion}
          onSignOut={actions.signOut}
        />
      </ScrollView>

      {/* Presentation-only Edit Profile Modal */}
      <EditProfileModal
        visible={modalVisible}
        name={editName}
        avatarUrl={editAvatarUrl}
        saving={savingProfile}
        error={error}
        onChangeName={setEditName}
        onChangeAvatarUrl={setEditAvatarUrl}
        onSave={handleSaveProfile}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.massive,
  },
});
