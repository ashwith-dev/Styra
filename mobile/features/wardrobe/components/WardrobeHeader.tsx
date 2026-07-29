import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing, typography } from "@/theme";
import { Badge } from "@/components/ui";

interface WardrobeHeaderProps {
  itemCount: number;
  onSignOut?: () => void;
}

/**
 * Top header for the Wardrobe screen.
 * Displays the STYRA-style title, item count badge, and optional sign-out.
 */
export function WardrobeHeader({ itemCount, onSignOut }: WardrobeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title} accessibilityRole="header">
          Your Wardrobe
        </Text>
        <Text style={styles.subtitle}>
          Organised beautifully for every occasion.
        </Text>
      </View>

      <View style={styles.right}>
        <Badge
          label={`${itemCount} Items`}
          variant="default"
          size="sm"
          testID="wardrobe-item-count"
        />
        {onSignOut && (
          <TouchableOpacity
            onPress={onSignOut}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            testID="wardrobe-sign-out"
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  left: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  right: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  signOutLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
