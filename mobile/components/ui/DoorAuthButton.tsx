import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface DoorAuthButtonProps {
  label: string;
  subtext?: string;
  onPress: () => Promise<boolean> | boolean | void;
  onSuccess?: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Micro-Animated Action Button with Stick Figure & Opening Door Portal.
 *
 * Sequence:
 * 1. Initial State: Stick figure stands next to door icon.
 * 2. Active Loading/Auth: Stick figure walks horizontally towards door, door panel swings open (3D rotateY).
 * 3. Validation Check:
 *    - INVALID Credentials: Door swings shut, stick figure slides back to starting position, button returns to initial "Sign In" state.
 *    - VALID Credentials: Stick figure steps into door, door panel closes with checkmark, button background turns colors.success (#3F7D58), displaying "Welcome Back!".
 */
export function DoorAuthButton({
  label,
  subtext = "Opening portal...",
  onPress,
  onSuccess,
  loading = false,
  disabled = false,
  style,
  testID,
}: DoorAuthButtonProps) {
  const [animState, setAnimState] = useState<"idle" | "animating" | "success">("idle");

  // Animated Values
  const figureX = useRef(new Animated.Value(0)).current;
  const figureOpacity = useRef(new Animated.Value(1)).current;
  const figureScale = useRef(new Animated.Value(1)).current;
  const legSwing = useRef(new Animated.Value(0)).current;
  const doorRotate = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successBgProgress = useRef(new Animated.Value(0)).current;

  const legLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const handlePress = async () => {
    if (disabled || loading || animState !== "idle") return;

    setAnimState("animating");

    // 1. Start Leg Gait Walking Loop
    legLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(legSwing, {
          toValue: 1,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(legSwing, {
          toValue: -1,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    legLoopRef.current.start();

    // 2. Translate Stick Figure towards Door
    Animated.timing(figureX, {
      toValue: 34,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      // 3. Door Opens
      Animated.timing(doorRotate, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(async () => {
        // 4. Perform Auth Check Callback
        let isSuccess = false;
        try {
          const res = await onPress();
          isSuccess = res === true;
        } catch {
          isSuccess = false;
        }

        if (isSuccess) {
          // --- AUTH SUCCESS: Continue to Welcome Back & Green State ---
          Animated.parallel([
            Animated.timing(figureX, {
              toValue: 44,
              duration: 300,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(figureScale, {
              toValue: 0.6,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(figureOpacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            legLoopRef.current?.stop();
            setAnimState("success");

            Animated.parallel([
              Animated.timing(doorRotate, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(successOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(successBgProgress, {
                toValue: 1,
                duration: 350,
                useNativeDriver: false,
              }),
            ]).start(() => {
              if (onSuccess) {
                setTimeout(onSuccess, 500);
              }
            });
          });
        } else {
          // --- INVALID CREDENTIALS: Reset back to initial state ---
          legLoopRef.current?.stop();
          legSwing.setValue(0);

          Animated.parallel([
            // Door swings shut
            Animated.timing(doorRotate, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
            // Stick figure walks back to start position
            Animated.timing(figureX, {
              toValue: 0,
              duration: 350,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(figureOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(figureScale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setAnimState("idle");
          });
        }
      });
    });
  };

  // Interpolations
  const doorRotateY = doorRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-75deg"],
  });

  const leftLegAngle = legSwing.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-25deg", "25deg"],
  });

  const rightLegAngle = legSwing.interpolate({
    inputRange: [-1, 1],
    outputRange: ["25deg", "-25deg"],
  });

  const interpolatedBgColor = successBgProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.accent, colors.success],
  });

  const isDisabled = disabled || loading || animState === "animating";

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.9}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: interpolatedBgColor },
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {/* Label & Subtext */}
        <View style={styles.textWrapper}>
          <Text style={styles.labelText}>
            {animState === "success"
              ? "Welcome Back!"
              : animState === "animating"
              ? "Signing In..."
              : label}
          </Text>
          {animState === "animating" && (
            <Text style={styles.subtextText}>{subtext}</Text>
          )}
        </View>

        {/* Animation Portal Zone */}
        <View style={styles.animZone}>
          {/* Threshold Line */}
          <View style={styles.floorLine} />

          {/* Door Frame & Panel */}
          <View style={styles.doorFrame}>
            <View style={styles.doorCavity} />
            <Animated.View
              style={[
                styles.doorPanel,
                {
                  transform: [{ rotateY: doorRotateY }],
                },
              ]}
            >
              <View style={styles.doorHandle} />
            </Animated.View>
          </View>

          {/* Stick Figure Character */}
          {animState !== "success" && (
            <Animated.View
              style={[
                styles.figureGroup,
                {
                  transform: [
                    { translateX: figureX },
                    { scale: figureScale },
                  ],
                  opacity: figureOpacity,
                },
              ]}
            >
              {/* Head */}
              <View style={styles.head} />
              {/* Torso */}
              <View style={styles.torso} />

              {/* Legs */}
              <View style={styles.legsRow}>
                <Animated.View
                  style={[
                    styles.leg,
                    { transform: [{ rotate: leftLegAngle }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.leg,
                    { transform: [{ rotate: rightLegAngle }] },
                  ]}
                />
              </View>
            </Animated.View>
          )}

          {/* Checkmark Overlay on Success */}
          <Animated.View style={[styles.checkmarkOverlay, { opacity: successOpacity }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.surface} />
          </Animated.View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: {
    opacity: 0.85,
  },
  textWrapper: {
    justifyContent: "center",
  },
  labelText: {
    ...typography.button,
    color: colors.surface,
    fontSize: 17,
    fontWeight: "700",
  },
  subtextText: {
    ...typography.caption,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    marginTop: 2,
  },
  animZone: {
    width: 80,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  floorLine: {
    position: "absolute",
    bottom: 2,
    left: 4,
    right: 4,
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderRadius: 1,
  },
  doorFrame: {
    position: "absolute",
    right: 8,
    bottom: 3,
    width: 20,
    height: 30,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 3,
    overflow: "hidden",
  },
  doorCavity: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0D0D11",
  },
  doorPanel: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
    borderRadius: 2,
    justifyContent: "center",
    paddingLeft: 2,
  },
  doorHandle: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textPrimary,
  },
  figureGroup: {
    position: "absolute",
    left: 4,
    bottom: 3,
    alignItems: "center",
    width: 16,
  },
  head: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  torso: {
    width: 1.8,
    height: 10,
    backgroundColor: colors.surface,
    marginTop: 1,
  },
  legsRow: {
    flexDirection: "row",
    gap: 3,
    marginTop: -1,
  },
  leg: {
    width: 1.8,
    height: 9,
    backgroundColor: colors.surface,
    borderRadius: 1,
  },
  checkmarkOverlay: {
    position: "absolute",
    right: 6,
    top: 6,
  },
});
