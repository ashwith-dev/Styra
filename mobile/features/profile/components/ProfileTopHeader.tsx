import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/theme";

export function ProfileTopHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.logoText}>STYRA</Text>

      <TouchableOpacity
        onPress={() => router.push("/settings")}
        style={styles.settingsBtn}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Settings"
        testID="profile-settings-btn"
      >
        <Ionicons name="settings-outline" size={20} color="#1A1A1A" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logoText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 3,
    color: "#000000",
    textTransform: "uppercase",
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F4F1EA",
    alignItems: "center",
    justifyContent: "center",
  },
});
