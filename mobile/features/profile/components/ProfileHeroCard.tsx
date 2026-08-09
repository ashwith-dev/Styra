import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
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
    backgroundColor: "#F7F5F0",
    borderRadius: 26,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
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
    backgroundColor: "#F7F5F0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    boxShadow: "-5px -5px 12px #FFFFFF, 5px 5px 12px rgba(185, 175, 158, 0.6)",
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  } as ViewStyle & { boxShadow?: string },
  initialText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 36,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#141412",
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
    backgroundColor: "#141412",
    borderRadius: radius.full,
    paddingVertical: 12,
    paddingHorizontal: spacing.xxl,
    boxShadow: "0px 8px 20px rgba(20, 20, 18, 0.35)",
    shadowColor: "#141412",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  } as ViewStyle & { boxShadow?: string },
  editBtnText: {
    ...typography.button,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
