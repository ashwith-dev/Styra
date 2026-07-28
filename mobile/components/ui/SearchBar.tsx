import { forwardRef } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  type ViewStyle,
} from "react-native";
import { colors, spacing, radius, typography } from "@/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  testID?: string;
  style?: ViewStyle;
}

export const SearchBar = forwardRef<TextInput, SearchBarProps>(function SearchBar(
  {
    value,
    onChangeText,
    placeholder = "Search...",
    accessibilityLabel = "Search",
    testID,
    style,
  },
  ref,
) {
  return (
    <View testID={testID} style={[styles.container, style]}>
      <Text style={styles.icon}>{"\u{1F50D}"}</Text>
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={accessibilityLabel}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          style={styles.clear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
    height: "100%",
  },
  clear: {
    padding: spacing.xxs,
  },
  clearText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
