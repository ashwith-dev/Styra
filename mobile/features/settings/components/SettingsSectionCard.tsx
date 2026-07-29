import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

interface SettingsSectionCardProps {
  title: string;
  children: ReactNode;
}

export function SettingsSectionCard({ title, children }: SettingsSectionCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeaderLabel}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  sectionHeaderLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
});
