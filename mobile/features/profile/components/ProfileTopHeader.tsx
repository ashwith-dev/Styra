import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "@/theme";

export function ProfileTopHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.logoText}>STYRA</Text>
    </View>
  );
}

export function StickySettingsButton() {
  return (
    <TouchableOpacity
      onPress={() => router.push("/settings")}
      style={styles.stickySettingsBtn}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Settings"
      testID="profile-settings-btn"
    >
      <Ionicons name="settings-outline" size={20} color="#1A1A1A" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  logoText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 3,
    color: "#000000",
    textTransform: "uppercase",
  },
  stickySettingsBtn: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xl,
    zIndex: 100,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F4F1EA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});
