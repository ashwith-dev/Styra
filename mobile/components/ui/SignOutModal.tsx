import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { colors, radius, spacing, typography } from "@/theme";

interface SignOutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function SignOutModal({ visible, onConfirm, onClose }: SignOutModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

        <Pressable style={styles.overlayPressable} onPress={onClose}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {/* Header Icon */}
            <View style={styles.iconCircle}>
              <Ionicons name="log-out-outline" size={26} color="#1A1A1A" />
            </View>

            {/* Title & Message */}
            <Text style={styles.title}>Sign Out</Text>
            <Text style={styles.message}>
              Are you sure you want to sign out of your STYRA account?
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonColumn}>
              <TouchableOpacity
                onPress={onConfirm}
                style={styles.confirmBtn}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Sign Out"
              >
                <Text style={styles.confirmBtnText}>Sign Out</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelBtn}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayPressable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F4F1EA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: "serif",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  message: {
    ...typography.body,
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  buttonColumn: {
    width: "100%",
    gap: spacing.sm,
  },
  confirmBtn: {
    backgroundColor: "#1A1A1A",
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmBtnText: {
    ...typography.button,
    color: colors.surface,
    fontSize: 15,
  },
  cancelBtn: {
    backgroundColor: "#F4F1EA",
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    ...typography.button,
    color: colors.textPrimary,
    fontSize: 15,
  },
});
