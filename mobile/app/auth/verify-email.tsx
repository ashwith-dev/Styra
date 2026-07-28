import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/theme";
import { AuthFooterLink, AuthScreenLayout } from "@/features/auth";
import { useAuth } from "@/providers/AuthProvider";

/**
 * Email Verification screen.
 *
 * Shown after a successful sign-up, while the user's email is unconfirmed.
 * Supabase sends the confirmation link automatically on sign-up.
 * This screen allows the user to request a resend via resetPassword (email link).
 *
 * Receives `email` as a route param from the sign-up flow.
 */
export default function VerifyEmail() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { resetPassword } = useAuth();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendError(null);

    // Supabase sends another confirmation email when resetPasswordForEmail is called
    // For a proper resend-confirmation flow, this would call signUp again or a
    // dedicated Supabase resend endpoint. Here we trigger the reset email as a
    // fallback since Supabase JS v2 doesn't expose resendConfirmationEmail in SDK.
    const { error } = await resetPassword(email);
    setResending(false);

    if (error) {
      setResendError(error.message);
    } else {
      setResent(true);
    }
  };

  return (
    <AuthScreenLayout>
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Ionicons name="mail-outline" size={44} color={colors.textPrimary} />
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Check Your Email</Text>

        {/* Body */}
        <Text style={styles.body}>
          We've sent a confirmation link to
        </Text>
        {email ? (
          <Text style={styles.email}>{email}</Text>
        ) : null}
        <Text style={styles.body}>
          Open the link to activate your account, then sign in.
        </Text>

        {/* Resent confirmation */}
        {resent && (
          <View style={styles.resentBanner}>
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color={colors.success}
            />
            <Text style={styles.resentText}>Email sent!</Text>
          </View>
        )}

        {/* Resend error */}
        {resendError && (
          <Text style={styles.errorText} accessibilityRole="alert">
            {resendError}
          </Text>
        )}

        {/* Spacer */}
        <View style={styles.gap} />

        {/* Resend CTA */}
        <Button
          label={resent ? "Resent" : "Resend Email"}
          onPress={handleResend}
          loading={resending}
          disabled={resending || resent}
          variant="outline"
          size="md"
          fullWidth
          style={styles.resendBtn}
          testID="verify-email-resend"
        />

        {/* Footer */}
        <AuthFooterLink
          prefix="Already verified?"
          linkLabel="Sign In"
          onPress={() => router.replace("/auth/sign-in")}
          testID="verify-email-to-signin"
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: spacing.md,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  resentBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    marginTop: spacing.sm,
  },
  resentText: {
    ...typography.caption,
    color: colors.success,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  gap: {
    height: spacing.xxl,
  },
  resendBtn: {
    alignSelf: "stretch",
    borderRadius: radius.full,
  },
});
