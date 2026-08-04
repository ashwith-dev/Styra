/**
 * LocationBanner.tsx
 * Slim dismissible light-red notification banner shown below STYRA logo
 * when location permission is off or denied.
 *
 * - Text: "Please allow location permission for better experience"
 * - Tapping text: opens device app settings (optional)
 * - Tapping X: dismisses banner for the session
 */

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography } from "@/theme";

interface LocationBannerProps {
  onOpenSettings?: () => void;
  onDismiss: () => void;
}

export function LocationBanner({ onOpenSettings, onDismiss }: LocationBannerProps) {
  return (
    <View style={styles.banner}>
      <Ionicons name="location-outline" size={13} color="#9B1C1C" style={styles.icon} />

      <TouchableOpacity
        onPress={onOpenSettings}
        activeOpacity={onOpenSettings ? 0.7 : 1}
        disabled={!onOpenSettings}
        accessibilityRole={onOpenSettings ? "button" : "text"}
        accessibilityLabel="Please allow location permission for better experience"
        style={styles.textWrap}
      >
        <Text style={styles.bannerText} numberOfLines={1}>
          Please allow location permission for better experience
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel="Dismiss location banner"
      >
        <Ionicons name="close" size={14} color="#9B1C1C" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  icon: {
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
  },
  bannerText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#9B1C1C",
  },
});
