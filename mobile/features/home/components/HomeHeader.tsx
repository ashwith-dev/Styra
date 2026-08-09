import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Avatar } from "@/components/ui/Avatar";
import { colors, spacing, typography } from "@/theme";
import { homeTokens } from "../theme/homeTokens";
import type { HomeHeaderProps } from "../types";

export function HomeHeader({
  userName,
  userAvatar,
  greetingTime,
  liveTemp,
  userLifestyle,
  onContextTagPress,
}: HomeHeaderProps) {
  const formattedName = userName
    ? userName.trim().split(" ")[0].replace(/[^a-zA-Z]/g, "")
    : "Alex";

  const displayName = formattedName
    ? formattedName.charAt(0).toUpperCase() + formattedName.slice(1).toLowerCase()
    : "Alex";

  const lifestyleLabel = userLifestyle
    ? userLifestyle.charAt(0).toUpperCase() + userLifestyle.slice(1).toLowerCase()
    : "COLLEGE";

  // When live temp is not loaded/available, show '_' (e.g. "_ • COLLEGE")
  const tempLabel = liveTemp ?? "_";
  const contextText = `${tempLabel} • ${lifestyleLabel}`;

  const isTappable = Boolean(onContextTagPress);

  return (
    <View style={styles.container}>
      {/* Top Header Bar: STYRA Logo + Raised Neumorphic Avatar */}
      <View style={styles.topRow}>
        <Text style={styles.logoText}>STYRA</Text>
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          activeOpacity={0.8}
          style={styles.neumorphicAvatarWrapper}
          accessibilityRole="button"
          accessibilityLabel="Profile settings"
        >
          <Avatar
            uri={userAvatar}
            name={displayName}
            size="md"
          />
        </TouchableOpacity>
      </View>

      {/* Greeting Section */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingTitle}>
          {greetingTime},
          {"\n"}
          {displayName}
        </Text>

        <View style={styles.subMetaRow}>
          <TouchableOpacity
            onPress={onContextTagPress}
            disabled={!isTappable}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel={`Location weather status: ${contextText}. Tap to update location.`}
            hitSlop={{ top: 8, bottom: 8, left: 0, right: 0 }}
          >
            <Text style={[styles.contextTag, !liveTemp && styles.contextTagTappable]}>
              • HOME  {contextText}
            </Text>
          </TouchableOpacity>
        </View>
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
  neumorphicAvatarWrapper: {
    borderRadius: 9999,
    padding: 3,
    backgroundColor: homeTokens.surface,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  greetingSection: {
    marginBottom: spacing.xs,
  },
  greetingTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 34,
    fontWeight: "700",
    color: homeTokens.textPrimary,
    lineHeight: 42,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  subMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  contextTag: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: homeTokens.textSecondary,
    textTransform: "uppercase",
  },
  contextTagTappable: {
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
  },
});
