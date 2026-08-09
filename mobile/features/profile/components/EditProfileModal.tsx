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
  email,
  phone,
  avatarUrl,
  saving,
  error,
  onChangeName,
  onChangePhone,
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
            Personal Information
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

          {/* Username Input (Editable) */}
          <Input
            label="Username / Full Name"
            placeholder="Enter your username..."
            value={name}
            onChangeText={onChangeName}
            hint="You can edit your username anytime."
            testID="edit-name-input"
          />

          {/* Email Input (Read-Only with Light Muted Color Indicator) */}
          <View style={styles.readOnlyWrapper}>
            <View style={styles.readOnlyHeader}>
              <Text style={styles.readOnlyLabel}>Email Address</Text>
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed-outline" size={12} color="#8E8B82" />
                <Text style={styles.lockBadgeText}>Cannot be changed</Text>
              </View>
            </View>
            <Input
              value={email}
              editable={false}
              placeholder="No email registered"
              hint="Registered account email is fixed for security."
              testID="edit-email-input"
            />
          </View>

          {/* Phone Number Input (Editable) */}
          <Input
            label="Phone Number"
            placeholder="Enter contact number..."
            value={phone}
            onChangeText={onChangePhone}
            keyboardType="phone-pad"
            hint="Contact number for account updates."
            testID="edit-phone-input"
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
  readOnlyWrapper: {
    marginBottom: 0,
  },
  readOnlyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xxs,
  },
  readOnlyLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F5F3ED",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  lockBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "500",
    color: "#8E8B82",
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
