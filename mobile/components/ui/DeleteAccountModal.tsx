import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface DeleteAccountModalProps {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteAccountModal({
  visible,
  onConfirm,
  onClose,
}: DeleteAccountModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Warning Icon Header */}
          <View style={styles.warningCircle}>
            <Ionicons name="trash-outline" size={26} color="#D32F2F" />
          </View>

          {/* Title & Destructive Warning Message */}
          <Text style={styles.title}>Delete Account?</Text>
          <Text style={styles.message}>
            This action is permanent and cannot be undone. All your wardrobe items, saved looks, preferences, and profile data will be permanently deleted.
          </Text>

          {/* Actions Column */}
          <View style={styles.buttonColumn}>
            <TouchableOpacity
              onPress={onConfirm}
              style={styles.deleteBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Delete Account"
            >
              <Text style={styles.deleteBtnText}>Delete Account</Text>
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FAD4D4",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  warningCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FDE8E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: "serif",
    fontSize: 22,
    fontWeight: "700",
    color: "#D32F2F",
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
  deleteBtn: {
    backgroundColor: "#D32F2F",
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteBtnText: {
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
