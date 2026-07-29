import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { colors, spacing, typography } from "@/theme";
import type { HomeHeaderProps } from "../types";

export function HomeHeader({
  userName,
  userAvatar,
  greetingTime,
  onSignOut,
}: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.greeting}>{greetingTime},</Text>
        <Text style={styles.userName} numberOfLines={1}>
          {userName || "Stylist"}
        </Text>
      </View>

      <View style={styles.right}>
        <Avatar uri={userAvatar} name={userName} size="md" />
        {onSignOut && (
          <TouchableOpacity
            onPress={onSignOut}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            testID="home-sign-out"
          >
            <Text style={styles.signOutLabel}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  left: {
    flex: 1,
    marginRight: spacing.md,
  },
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  right: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  signOutLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
});
