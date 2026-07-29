import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "@/theme";
import type { ProfileUser } from "@/features/profile";

interface SettingsProfileHeroCardProps {
  user: ProfileUser;
  onPress: () => void;
}

export function SettingsProfileHeroCard({
  user,
  onPress,
}: SettingsProfileHeroCardProps) {
  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Edit profile for ${user.name}`}
    >
      {/* Avatar Image or Initial Circle */}
      {user.avatarUrl ? (
        <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.initialText}>{initial}</Text>
        </View>
      )}

      <View style={styles.nameContainer}>
        <Text style={styles.userName}>{user.name}</Text>
        <View style={styles.accentPill} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F5F2EC",
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F4F1EA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E1D8",
  },
  initialText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  nameContainer: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  accentPill: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0DDD5",
  },
});
