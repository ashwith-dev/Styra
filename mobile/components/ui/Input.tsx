import { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, isPassword, secureTextEntry, testID, style, editable, ...rest },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const passwordField = isPassword || secureTextEntry;
  const isReadOnly = editable === false;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          ref={ref}
          testID={testID}
          editable={editable}
          style={[
            styles.input,
            error && styles.inputError,
            isReadOnly && styles.inputDisabled,
            passwordField && styles.inputWithIcon,
            style,
          ]}
          placeholderTextColor={isReadOnly ? "#A09C94" : colors.textSecondary}
          autoCapitalize="none"
          accessibilityLabel={label}
          secureTextEntry={passwordField ? !showPassword : secureTextEntry}
          {...rest}
        />

        {passwordField && (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#7F7C76"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#F2EFE8",
    color: colors.textPrimary,
    minHeight: 50,
    boxShadow: "inset 2px 2px 5px rgba(185, 175, 158, 0.5), inset -2px -2px 5px #FFFFFF",
  } as ViewStyle & { boxShadow?: string },
  inputWithIcon: {
    paddingRight: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: "#F5F3ED",
    borderColor: "#E5E2D9",
    color: "#8E8B82",
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    ...typography.caption,
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xxs,
  },
  hint: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
});
