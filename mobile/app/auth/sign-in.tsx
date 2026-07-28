import { useRef } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { TextInput } from "react-native";
import { router } from "expo-router";
import { Button, Input } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/theme";
import {
  AuthDivider,
  AuthFooterLink,
  AuthScreenLayout,
  SocialButton,
  useSignInForm,
} from "@/features/auth";

/**
 * Sign In screen — STYRA branded design.
 *
 * Layout: STYRA logo → headline → email/password inputs →
 *         FORGOT PASSWORD link → Continue CTA →
 *         OR CONTINUE WITH divider → Google → footer link.
 */
export default function SignIn() {
  const {
    email,
    password,
    emailError,
    passwordError,
    submitError,
    loading,
    setEmail,
    setPassword,
    passwordRef,
    handleSubmit,
  } = useSignInForm();

  const handleGoogleSignIn = () => {
    Alert.alert(
      "Coming Soon",
      "Google sign-in requires additional native setup. Check back in a future release.",
    );
  };

  return (
    <AuthScreenLayout>
      {/* Headline */}
      <View style={styles.header}>
        <Text style={styles.heading}>Welcome Back</Text>
        <Text style={styles.subheading}>Continue your styling journey.</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Input
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          error={emailError ?? undefined}
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          testID="sign-in-email"
          accessibilityLabel="Email Address"
        />

        <Input
          ref={passwordRef}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          error={passwordError ?? undefined}
          secureTextEntry
          autoComplete="password"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          testID="sign-in-password"
          accessibilityLabel="Password"
        />

        {/* Forgot password — right-aligned */}
        <View style={styles.forgotRow}>
          <TouchableOpacity
            onPress={() => router.push("/auth/forgot-password")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="link"
            accessibilityLabel="Forgot password"
            testID="sign-in-forgot"
          >
            <Text style={styles.forgotLabel}>FORGOT PASSWORD?</Text>
          </TouchableOpacity>
        </View>

        {/* Submit error */}
        {submitError && (
          <Text style={styles.submitError} accessibilityRole="alert">
            {submitError}
          </Text>
        )}
      </View>

      {/* Primary CTA */}
      <Button
        label="Continue"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        variant="primary"
        size="lg"
        fullWidth
        style={styles.primaryBtn}
        testID="sign-in-submit"
      />

      {/* Social sign-in */}
      <AuthDivider />
      <SocialButton
        label="Continue with Google"
        onPress={handleGoogleSignIn}
        testID="sign-in-google"
      />

      {/* Footer */}
      <AuthFooterLink
        prefix="Don't have an account?"
        linkLabel="Sign Up"
        onPress={() => router.push("/auth/sign-up")}
        testID="sign-in-to-signup"
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  form: {
    alignSelf: "stretch",
    marginBottom: spacing.sm,
  },
  forgotRow: {
    alignItems: "flex-end",
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  forgotLabel: {
    ...typography.label,
    fontSize: 11,
    color: colors.textSecondary,
  },
  submitError: {
    ...typography.caption,
    color: colors.error,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  primaryBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    alignSelf: "stretch",
  },
});
