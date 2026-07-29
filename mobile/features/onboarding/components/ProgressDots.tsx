import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";
import { TOTAL_ONBOARDING_STEPS } from "../config";

interface ProgressDotsProps {
  currentStep: number;
  totalSteps?: number;
  showStepText?: boolean;
}

export function ProgressDots({
  currentStep,
  totalSteps = TOTAL_ONBOARDING_STEPS,
  showStepText = true,
}: ProgressDotsProps) {
  const dots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {showStepText && (
        <Text style={styles.stepText}>
          STEP {currentStep} OF {totalSteps}
        </Text>
      )}

      <View style={styles.dotsRow}>
        {dots.map((step) => {
          const isCompletedOrCurrent = step <= currentStep;
          return (
            <View
              key={step}
              style={[
                styles.dot,
                isCompletedOrCurrent ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  stepText: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: colors.textPrimary,
  },
  inactiveDot: {
    backgroundColor: "#E2DFD8",
  },
});
