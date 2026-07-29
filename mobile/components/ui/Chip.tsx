import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { colors, spacing, radius, typography } from "@/theme";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
}

export function Chip({
  label,
  selected = false,
  onPress,
  disabled,
  testID,
  style,
}: ChipProps) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.surface,
    fontWeight: "600",
  },
});
