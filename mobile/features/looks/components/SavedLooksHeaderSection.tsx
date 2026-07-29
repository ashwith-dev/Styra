import { Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface SavedLooksHeaderSectionProps {
  count: number;
}

export function SavedLooksHeaderSection({ count }: SavedLooksHeaderSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Looks</Text>
      <Text style={styles.subtitle}>
        Your favourite outfits, ready whenever you need them.
      </Text>

      <View style={styles.countBadge}>
        <Text style={styles.countBadgeText}>
          {count} {count === 1 ? "SAVED LOOK" : "SAVED LOOKS"}
        </Text>
        <Ionicons name="bookmark-outline" size={14} color="#7F7C76" />
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
  title: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F4F1EA",
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  countBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
    textTransform: "uppercase",
  },
});
