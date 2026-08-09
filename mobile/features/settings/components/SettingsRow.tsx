import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/theme";

interface SettingsRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  isLast?: boolean;
}

export const SettingsRow = memo(function SettingsRow({
  iconName,
  title,
  onPress,
  isLast = false,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, !isLast && styles.rowBorder]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.leftGroup}>
        <Ionicons name={iconName} size={20} color={colors.textPrimary} style={styles.icon} />
        <Text style={styles.titleText}>{title}</Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#7F7C76" />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    backgroundColor: "#F7F5F0",
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  icon: {
    width: 24,
    textAlign: "center",
  },
  titleText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
});
