/**
 * Premium AI generation loading experience.
 *
 * Animated progress bar with cycling editorial messages.
 * Feels like an intelligent assistant working, not a spinner.
 */

import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface GenerationLoadingProps {
  message: string;
  progress: number;
}

const STEPS = [
  { icon: "shirt-outline" as const, label: "Wardrobe" },
  { icon: "options-outline" as const, label: "Matching" },
  { icon: "color-palette-outline" as const, label: "Styling" },
  { icon: "sparkles-outline" as const, label: "Finalizing" },
];

export function GenerationLoading({ message, progress }: GenerationLoadingProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    loopRef.current = loop;
    return () => {
      loop.stop();
      loopRef.current = null;
    };
  }, [pulseAnim]);

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: progress,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress, barWidth]);

  const activeStepIndex = Math.min(
    Math.floor(progress * STEPS.length),
    STEPS.length - 1
  );

  const barWidthInterpolated = barWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}
      >
        <Ionicons name="sparkles" size={48} color={colors.textPrimary} />
      </Animated.View>

      <Text style={styles.message}>{message}</Text>

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[styles.progressBar, { width: barWidthInterpolated }]}
        />
      </View>

      <View style={styles.steps}>
        {STEPS.map((step, i) => (
          <View key={step.label} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                i <= activeStepIndex && styles.stepDotActive,
              ]}
            >
              {i < activeStepIndex ? (
                <Ionicons name="checkmark" size={12} color={colors.surface} />
              ) : (
                <Ionicons
                  name={step.icon}
                  size={12}
                  color={i === activeStepIndex ? colors.surface : colors.textSecondary}
                />
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                i <= activeStepIndex && styles.stepLabelActive,
              ]}
            >
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  message: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xxl,
    minHeight: 36,
  },
  progressBarContainer: {
    width: SCREEN_WIDTH * 0.6,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.xxl,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.textPrimary,
    borderRadius: 2,
  },
  steps: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  stepItem: {
    alignItems: "center",
    gap: spacing.xxs,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  stepLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  stepLabelActive: {
    color: colors.textPrimary,
  },
});
