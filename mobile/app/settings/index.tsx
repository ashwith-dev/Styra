import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight, spacing } from "../../lib/theme";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
