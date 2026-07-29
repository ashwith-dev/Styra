import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface OnboardingFooterProps {
  onContinue: () => void;
  onSkip?: () => void;
  onNext?: () => void;
  continueLabel?: string;
  disabled?: boolean;
  showNextArrow?: boolean;
  showSkipButton?: boolean;
  centerContinue?: boolean;
}

export function OnboardingFooter({
  onContinue,
  onSkip,
  onNext,
  continueLabel = "Continue >",
  disabled = false,
  showNextArrow = false,
  showSkipButton = false,
  centerContinue = false,
}: OnboardingFooterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {showSkipButton && onSkip ? (
          <TouchableOpacity
            onPress={onSkip}
            style={styles.skipBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.leftPlaceholder} />
        )}

        <TouchableOpacity
          onPress={onContinue}
          disabled={disabled}
          style={[
            styles.continueBtn,
            centerContinue && styles.continueBtnCenter,
            disabled ? styles.disabledBtn : styles.activeBtn,
          ]}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={continueLabel}
        >
          <Text style={[styles.continueText, disabled && styles.disabledText]}>
            {continueLabel}
          </Text>
        </TouchableOpacity>

        {showNextArrow && onNext ? (
          <TouchableOpacity
            onPress={onNext}
            style={styles.circleBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Next step"
          >
            <Ionicons name="chevron-forward-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.circlePlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: "#FAF8F5",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    justifyContent: "center",
  },
  skipText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  leftPlaceholder: {
    width: 48,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EAE7E1",
    alignItems: "center",
    justifyContent: "center",
  },
  circlePlaceholder: {
    width: 44,
  },
  continueBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 160,
  },
  continueBtnCenter: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  activeBtn: {
    backgroundColor: colors.textPrimary,
  },
  disabledBtn: {
    backgroundColor: "#B0ACA5",
  },
  continueText: {
    ...typography.body,
    fontWeight: "600",
    color: colors.surface,
    fontSize: 15,
  },
  disabledText: {
    color: "#F0EEEA",
  },
});
