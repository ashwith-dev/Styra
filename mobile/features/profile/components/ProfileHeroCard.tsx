import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
import type { ProfileUser } from "../types/profile";

interface ProfileHeroCardProps {
  user: ProfileUser;
  onEditProfile: () => void;
}

export function ProfileHeroCard({ user, onEditProfile }: ProfileHeroCardProps) {
  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <View style={styles.card}>
      {/* Avatar Container with Camera Badge */}
      <View style={styles.avatarWrapper}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initialText}>{initial}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onEditProfile}
          style={styles.cameraBadge}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Edit profile picture"
        >
          <Ionicons name="camera" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* User Name & Email */}
      <Text style={styles.userName}>{user.name}</Text>
      <Text style={styles.userEmail}>{user.email}</Text>

      {/* Edit Profile Button */}
      <TouchableOpacity
        onPress={onEditProfile}
        style={styles.editBtn}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Edit Profile"
      >
        <Text style={styles.editBtnText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F5F2EC",
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F4F1EA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E1D8",
  },
  initialText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 36,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    ...typography.caption,
    fontSize: 14,
    color: "#7F7C76",
    marginBottom: spacing.lg,
  },
  editBtn: {
    backgroundColor: "#1A1A1A",
    borderRadius: radius.full,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
  },
  editBtnText: {
    ...typography.button,
    color: colors.surface,
    fontSize: 14,
  },
});
