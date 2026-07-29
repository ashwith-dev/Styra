import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "@/theme";

interface AuthScreenLayoutProps {
  /** Screen content rendered below the brand mark */
  children: ReactNode;
  /** Whether to render the STYRA brand mark (default: true) */
  showLogo?: boolean;
}

/**
 * Shared full-screen wrapper for all auth screens.
 * Handles safe area, keyboard avoidance, and the STYRA brand mark.
 */
export function AuthScreenLayout({
  children,
  showLogo = true,
}: AuthScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {showLogo && (
            <View style={styles.logoWrapper}>
              <Text
                style={styles.brand}
                accessibilityRole="header"
                accessibilityLabel="STYRA"
              >
                STYRA
              </Text>
            </View>
          )}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  brand: {
    ...typography.h1,
    letterSpacing: 6,
    textTransform: "uppercase",
    color: colors.textPrimary,
  },
});
