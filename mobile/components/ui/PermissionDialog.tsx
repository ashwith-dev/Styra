/**
 * PermissionDialog.tsx
 * A reusable in-app dialog shown after a native permission request is denied.
 * Used by both location and notification permission flows.
 *
 * This is intentionally a simple, focused component — it does NOT replace
 * the native OS permission dialog. It only appears AFTER the native dialog
 * has already been dismissed.
 */

import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface PermissionDialogProps {
  visible: boolean;
  /** Dialog title, e.g. "Location Permission Required" */
  title: string;
  /** Explanatory message shown below the title */
  message: string;
  /** Primary (filled) button label, e.g. "Open Settings" */
  primaryLabel: string;
  /** Secondary (outline) button label, e.g. "Maybe Later" */
  secondaryLabel: string;
  /** Ionicons icon name for the top icon — defaults to "alert-circle-outline" */
  iconName?: React.ComponentProps<typeof Ionicons>["name"];
  /** Called when the user taps the primary button */
  onPrimary: () => void;
  /** Called when the user taps the secondary button */
  onSecondary: () => void;
}

export function PermissionDialog({
  visible,
  title,
  message,
  primaryLabel,
  secondaryLabel,
  iconName = "alert-circle-outline",
  onPrimary,
  onSecondary,
}: PermissionDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onSecondary}
      accessibilityViewIsModal
    >
      {/* Backdrop */}
      <View style={styles.backdrop}>
        {/* Dialog card */}
        <View style={styles.card} accessibilityRole="alert">
          {/* Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name={iconName} size={28} color={colors.textPrimary} />
          </View>

          {/* Title */}
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            {/* Primary — Open Settings */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onPrimary}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel={primaryLabel}
              testID="permission-dialog-primary-btn"
            >
              <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
            </TouchableOpacity>

            {/* Secondary — Maybe Later */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onSecondary}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={secondaryLabel}
              testID="permission-dialog-secondary-btn"
            >
              <Text style={styles.secondaryBtnText}>{secondaryLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FAF8F5",
    borderWidth: 1,
    borderColor: "#EFECE6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: "serif",
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  buttonGroup: {
    width: "100%",
    gap: spacing.sm,
  },
  primaryBtn: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface,
  },
  secondaryBtn: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E1D8",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
