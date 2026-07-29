import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { colors, radius, spacing, typography } from "@/theme";
import type { EditProfileModalProps } from "../types/profile";

export function EditProfileModal({
  visible,
  name,
  avatarUrl,
  saving,
  error,
  onChangeName,
  onChangeAvatarUrl,
  onSave,
  onClose,
}: EditProfileModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <LoadingOverlay visible={saving} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            disabled={saving}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Edit Profile
          </Text>
          <TouchableOpacity
            onPress={onSave}
            disabled={saving}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Save profile"
          >
            <Text style={styles.saveHeaderLabel}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Form Body */}
        <View style={styles.formContent}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Input
            label="Full Name"
            placeholder="Enter your name..."
            value={name}
            onChangeText={onChangeName}
            testID="edit-name-input"
          />

          <Input
            label="Avatar URL (Optional)"
            placeholder="https://example.com/avatar.jpg"
            value={avatarUrl}
            onChangeText={onChangeAvatarUrl}
            autoCapitalize="none"
            keyboardType="url"
            testID="edit-avatar-input"
          />

          <View style={styles.spacer} />

          <Button
            label="Save Changes"
            onPress={onSave}
            loading={saving}
            disabled={saving}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.primaryBtn}
            testID="save-profile-btn"
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  saveHeaderLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.accent,
  },
  formContent: {
    padding: spacing.xl,
    flex: 1,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  spacer: {
    flex: 1,
  },
  primaryBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
  },
});
