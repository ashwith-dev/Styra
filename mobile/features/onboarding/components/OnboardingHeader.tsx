import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/theme";
import { ProgressDots } from "./ProgressDots";

interface OnboardingHeaderProps {
  currentStep: number;
  onBack?: () => void;
  title?: string;
  showBack?: boolean;
}

export function OnboardingHeader({
  currentStep,
  onBack,
  title = "Curated",
  showBack = true,
}: OnboardingHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBack && onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <Text style={styles.brandTitle}>{title}</Text>

        <View style={styles.backPlaceholder} />
      </View>

      <ProgressDots currentStep={currentStep} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: "#FAF8F5",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xxs,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backPlaceholder: {
    width: 36,
  },
  brandTitle: {
    fontFamily: "serif",
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
});
