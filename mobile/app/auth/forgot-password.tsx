import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/theme";
import {
  AuthFooterLink,
  AuthScreenLayout,
  useForgotPasswordForm,
} from "@/features/auth";

/**
 * Forgot Password screen — STYRA branded.
 *
 * Two states:
 *   1. Form state — user enters email and taps "Send Reset Link"
 *   2. Success state — confirmation message with resend option
 */
export default function ForgotPassword() {
  const { email, emailError, submitError, loading, submitted, setEmail, handleSubmit } =
    useForgotPasswordForm();

  return (
    <AuthScreenLayout>
      {/* Back button */}
      <View style={styles.backRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="forgot-password-back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {submitted ? (
        /* ── Success state ── */
        <View style={styles.successContainer}>
          <View style={styles.iconWrapper}>
            <Ionicons name="mail-outline" size={40} color={colors.textPrimary} />
          </View>
          <Text style={styles.heading}>Check Your Email</Text>
          <Text style={styles.subheading}>
            We've sent a reset link to{"\n"}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Text style={styles.note}>
            Didn't receive it? Check your spam folder or try again.
          </Text>

          <Button
            label="Send Again"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            variant="outline"
            size="md"
            fullWidth
            style={styles.resendBtn}
            testID="forgot-password-resend"
          />

          <AuthFooterLink
            prefix="Remember your password?"
            linkLabel="Sign In"
            onPress={() => router.replace("/auth/sign-in")}
            testID="forgot-password-to-signin"
          />
        </View>
      ) : (
        /* ── Form state ── */
        <>
          <View style={styles.header}>
            <Text style={styles.heading}>Reset Password</Text>
            <Text style={styles.subheading}>
              Enter your email and we'll send a link to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              error={emailError ?? undefined}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              testID="forgot-password-email"
              accessibilityLabel="Email Address"
            />

            {submitError && (
              <Text style={styles.submitError} accessibilityRole="alert">
                {submitError}
              </Text>
            )}
          </View>

          <Button
            label="Send Reset Link"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.primaryBtn}
            testID="forgot-password-submit"
          />

          <AuthFooterLink
            prefix="Remember your password?"
            linkLabel="Sign In"
            onPress={() => router.back()}
            testID="forgot-password-to-signin"
          />
        </>
      )}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
    marginTop: -spacing.lg,
  },
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
    lineHeight: 24,
  },
  form: {
    alignSelf: "stretch",
    marginBottom: spacing.sm,
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
  // Success state
  successContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: spacing.lg,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  emailHighlight: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  resendBtn: {
    alignSelf: "stretch",
    borderRadius: radius.full,
  },
});
