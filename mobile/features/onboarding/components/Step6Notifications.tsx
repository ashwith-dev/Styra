import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
import { STEP6_NOTIF_IMAGE } from "../config";
import { OnboardingFooter } from "./OnboardingFooter";
import { OnboardingHeader } from "./OnboardingHeader";
import { PermissionDialog } from "@/components/ui/PermissionDialog";
import {
  NOTIFICATION_DENIED_DIALOG,
} from "@/lib/services/permissionConstants";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";

interface Step6NotificationsProps {
  onAllow: () => void;
  onMaybeLater: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function Step6Notifications({
  onAllow,
  onMaybeLater,
  onBack,
  onSkip,
}: Step6NotificationsProps) {
  const {
    showDeniedDialog,
    isRequesting,
    requestAndHandlePermission,
    handleDialogPrimary,
    handleDialogSecondary,
  } = useNotificationPermission();

  const handleAllowPress = () => {
    void requestAndHandlePermission(
      // Granted
      () => onAllow(),
      // Denied (user tapped "Maybe Later" in the in-app dialog)
      () => onMaybeLater(),
    );
  };

  const handleMaybeLaterPress = () => {
    // User skipped without tapping "Allow" at all — go to next step
    onMaybeLater();
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader currentStep={6} onBack={onBack} title="Curated" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Phone Preview Card with Notification Overlay */}
        <ImageBackground
          source={{ uri: STEP6_NOTIF_IMAGE }}
          style={styles.heroCard}
          imageStyle={{ borderRadius: 28 }}
        >
          <View style={styles.notifBadge}>
            <View style={styles.bellIconBox}>
              <Ionicons name="notifications" size={16} color={colors.surface} />
            </View>
            <View style={styles.notifTextGroup}>
              <Text style={styles.notifTag}>MORNING BRIEFING</Text>
              <Text style={styles.notifTitle}>Wear the linen blazer today.</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Title & Description */}
        <View style={styles.textContainer}>
          <Text style={styles.heading}>Stay in Style.</Text>
          <Text style={styles.subheading}>
            Enable daily outfit reminders and weather-based suggestions tailored just
            for you.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsGroup}>
          <TouchableOpacity
            onPress={handleAllowPress}
            style={[styles.allowBtn, isRequesting && styles.allowBtnDisabled]}
            activeOpacity={0.88}
            disabled={isRequesting}
            accessibilityRole="button"
            accessibilityLabel="Turn On Notifications"
          >
            <Text style={styles.allowBtnText}>
              {isRequesting ? "Requesting…" : "Turn On Notifications"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMaybeLaterPress}
            style={styles.maybeBtn}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Maybe Later"
          >
            <Text style={styles.maybeBtnText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <OnboardingFooter
        onContinue={handleAllowPress}
        onSkip={onSkip}
        onNext={handleAllowPress}
        showSkipButton={true}
        showNextArrow={true}
        continueLabel="Continue"
        centerContinue={false}
      />

      {/* In-app dialog shown after native dialog is denied */}
      <PermissionDialog
        visible={showDeniedDialog}
        title={NOTIFICATION_DENIED_DIALOG.title}
        message={NOTIFICATION_DENIED_DIALOG.message}
        primaryLabel={NOTIFICATION_DENIED_DIALOG.primaryLabel}
        secondaryLabel={NOTIFICATION_DENIED_DIALOG.secondaryLabel}
        iconName="notifications-off-outline"
        onPrimary={handleDialogPrimary}
        onSecondary={() => {
          handleDialogSecondary();
          onMaybeLater();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  heroCard: {
    height: 300,
    borderRadius: 28,
    overflow: "hidden",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  notifBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    padding: spacing.md,
    borderRadius: 18,
    gap: spacing.sm,
  },
  bellIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  notifTextGroup: {
    flex: 1,
  },
  notifTag: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#7F7C76",
    marginBottom: 2,
  },
  notifTitle: {
    fontFamily: "serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  heading: {
    fontFamily: "serif",
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subheading: {
    ...typography.body,
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
  },
  actionsGroup: {
    gap: spacing.sm,
  },
  allowBtn: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  allowBtnDisabled: {
    opacity: 0.6,
  },
  allowBtnText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface,
  },
  maybeBtn: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: "#FAF8F5",
    borderWidth: 1,
    borderColor: "#E5E1D8",
    alignItems: "center",
    justifyContent: "center",
  },
  maybeBtnText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
