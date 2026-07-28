import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "@/theme";

/**
 * STYRA Splash Screen.
 *
 * Shown once at app launch (when the user is not authenticated).
 * Fades in the brand mark + tagline, then auto-advances to Sign In.
 */
export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    // Fade + slide up entrance animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance after animation settles
    const timer = setTimeout(() => {
      router.replace("/auth/sign-in");
    }, 2000);

    return () => clearTimeout(timer);
  }, [opacity, translateY]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
          <Text style={styles.brand} accessibilityRole="header">
            STYRA
          </Text>
          <Text style={styles.tagline}>Your AI Personal Wardrobe</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  brand: {
    ...typography.h1,
    letterSpacing: 8,
    textTransform: "uppercase",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
