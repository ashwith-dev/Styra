import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { colors, spacing, typography } from "@/theme";
import type { ProfileUser } from "../types/profile";

interface ProfileHeaderCardProps {
  user: ProfileUser;
  onEditProfile: () => void;
}

export function ProfileHeaderCard({
  user,
  onEditProfile,
}: ProfileHeaderCardProps) {
  return (
    <Card variant="flat" padding="lg" style={styles.card}>
      <View style={styles.contentRow}>
        <Avatar uri={user.avatarUrl} name={user.name} size="lg" />

        <View style={styles.infoGroup}>
          <Text style={styles.name} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {user.email}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onEditProfile}
          style={styles.editBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          testID="profile-edit-btn"
        >
          <Ionicons name="pencil-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  infoGroup: {
    flex: 1,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  email: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  editBtn: {
    padding: spacing.xs,
  },
});
