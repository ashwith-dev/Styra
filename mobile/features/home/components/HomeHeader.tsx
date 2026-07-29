import { Platform, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Avatar } from "@/components/ui/Avatar";
import { colors, spacing, typography } from "@/theme";
import type { HomeHeaderProps } from "../types";

export function HomeHeader({
  userName,
  userAvatar,
  greetingTime,
}: HomeHeaderProps) {
  // Format user name cleanly (e.g. "Ashwith" or "Alex" instead of raw email address)
  const formattedName = userName
    ? userName.trim().split(" ")[0].replace(/[^a-zA-Z]/g, "")
    : "Alex";

  const displayName = formattedName
    ? formattedName.charAt(0).toUpperCase() + formattedName.slice(1).toLowerCase()
    : "Alex";

  return (
    <View style={styles.container}>
      {/* Top Header Bar: High-contrast editorial serif STYRA Logo on Left, Profile Avatar on Right */}
      <View style={styles.topRow}>
        <Text style={styles.logoText}>STYRA</Text>
        <Avatar
          uri={userAvatar}
          name={displayName}
          size="md"
          onPress={() => router.push("/profile")}
        />
      </View>

      {/* Greeting Section: Editorial Serif Headline & Context Tag */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingTitle}>
          {greetingTime}, {displayName}
        </Text>
        <Text style={styles.contextTag}>32°C • COLLEGE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  logoText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 3,
    color: "#000000",
    textTransform: "uppercase",
  },
  greetingSection: {
    marginBottom: spacing.xs,
  },
  greetingTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 40,
    marginBottom: 4,
  },
  contextTag: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
    textTransform: "uppercase",
  },
});
