import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
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
    backgroundColor: "#F7F5F0",
    borderRadius: 26,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.lg,
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
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
    backgroundColor: "#F7F5F0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    boxShadow: "-4px -4px 10px #FFFFFF, 4px 4px 10px rgba(185, 175, 158, 0.55)",
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle & { boxShadow?: string },
  initialText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
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
    backgroundColor: "#DCD8CE",
  },
});
