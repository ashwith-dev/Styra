import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Avatar } from "@/components/ui/Avatar";
import { colors, spacing, typography } from "@/theme";
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
      {/* Top Header Bar: STYRA Logo + Profile Avatar */}
      <View style={styles.topRow}>
        <Text style={styles.logoText}>STYRA</Text>
        <Avatar
          uri={userAvatar}
          name={displayName}
          size="md"
          onPress={() => router.push("/profile")}
        />
      </View>

      {/* Greeting Section */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingTitle}>
          {greetingTime}, {displayName}
        </Text>

        {/* Context tag — live temp + lifestyle (e.g. "29°C • College" or "_ • College"). Tappable to request location */}
        <TouchableOpacity
          onPress={onContextTagPress}
          disabled={!isTappable}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel={`Location weather status: ${contextText}. Tap to update location.`}
          hitSlop={{ top: 8, bottom: 8, left: 0, right: 0 }}
        >
          <Text style={[styles.contextTag, !liveTemp && styles.contextTagTappable]}>
            {contextText}
          </Text>
        </TouchableOpacity>
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
  contextTagTappable: {
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
  },
});
