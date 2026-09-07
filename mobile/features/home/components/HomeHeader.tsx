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
  userFitPreference,
  userLifestyle,
  onContextTagPress,
}: HomeHeaderProps) {
  const formattedName = userName
    ? userName.trim().split(" ")[0].replace(/[^a-zA-Z]/g, "")
    : "Alex";

  const displayName = formattedName
    ? formattedName.charAt(0).toUpperCase() + formattedName.slice(1).toLowerCase()
    : "Alex";

  // Display user's selected fit preference (e.g. "SLIM", "REGULAR", "OVERSIZED"),
  // with fallback to lifestyle or "REGULAR"
  const rawPreference = userFitPreference || userLifestyle || "REGULAR";
  const preferenceLabel = rawPreference.toUpperCase();

  // When live temp is not loaded/available, show red 'TEMP' as a tappable prompt
  const hasTemp = Boolean(liveTemp);
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
          {/* Temp part: red + tappable when no location, normal when available */}
          {hasTemp ? (
            <Text style={styles.contextTag}>{liveTemp}</Text>
          ) : (
            <TouchableOpacity
              onPress={onContextTagPress}
              disabled={!isTappable}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel="Tap to enable location and get live temperature"
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text style={[styles.contextTag, styles.tempUnavailable]}>TEMP</Text>
            </TouchableOpacity>
          )}

          {/* Pipe separator */}
          <Text style={styles.contextSeparator}> | </Text>

          {/* Fit preference — always static */}
          <Text style={styles.contextTag}>{preferenceLabel}</Text>
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
  contextSeparator: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "400",
    color: homeTokens.textSecondary,
    opacity: 0.5,
  },
  tempUnavailable: {
    color: "#D94F3D",
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
  },
});
