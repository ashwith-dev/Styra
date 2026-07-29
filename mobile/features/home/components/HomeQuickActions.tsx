import { StyleSheet, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { colors, radius, spacing } from "@/theme";
import type { HomeQuickActionsProps } from "../types";

export function HomeQuickActions({
  onAddClothing,
  onViewWardrobe,
}: HomeQuickActionsProps) {
  return (
    <View style={styles.container}>
      <Button
        label="+ Add Clothing"
        onPress={onAddClothing}
        variant="primary"
        size="md"
        style={styles.primaryBtn}
        testID="home-quick-add"
      />
      <Button
        label="View Wardrobe"
        onPress={onViewWardrobe}
        variant="outline"
        size="md"
        style={styles.outlineBtn}
        testID="home-quick-wardrobe"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
  },
  outlineBtn: {
    flex: 1,
    borderRadius: radius.full,
  },
});
