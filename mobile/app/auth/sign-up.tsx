import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Input } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/theme";
import {
  AuthDivider,
  AuthFooterLink,
  AuthScreenLayout,
  SocialButton,
  useSignUpForm,
} from "@/features/auth";

/**
 * Sign Up screen — STYRA branded design.
 *
 * Layout: STYRA logo → "Create Your Stylist" → name/email/password inputs →
 *         Create Account CTA → OR CONTINUE WITH → Google → footer link.
 */
export default function SignUp() {
  const {
    name,
    email,
    password,
    nameError,
    emailError,
    passwordError,
    submitError,
    loading,
    setName,
    setEmail,
    setPassword,
    emailRef,
    passwordRef,
    handleSubmit,
  } = useSignUpForm();

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
        <Text style={styles.heading}>Create Your Stylist</Text>
        <Text style={styles.subheading}>Build your personal AI wardrobe.</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Input
          placeholder="Name"
          value={name}
          onChangeText={setName}
          error={nameError ?? undefined}
          autoComplete="name"
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          testID="sign-up-name"
          accessibilityLabel="Name"
        />

        <Input
          ref={emailRef}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          error={emailError ?? undefined}
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          testID="sign-up-email"
          accessibilityLabel="Email Address"
        />

        <Input
          ref={passwordRef}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          error={passwordError ?? undefined}
          isPassword
          autoComplete="new-password"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          testID="sign-up-password"
          accessibilityLabel="Password"
        />

        {/* Submit error */}
        {submitError && (
          <Text style={styles.submitError} accessibilityRole="alert">
            {submitError}
          </Text>
        )}
      </View>

      {/* Primary CTA */}
      <Button
        label="Create Account"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        variant="primary"
        size="lg"
        fullWidth
        style={styles.primaryBtn}
        testID="sign-up-submit"
      />

      {/* Social sign-in */}
      <AuthDivider />
      <SocialButton
        label="Continue with Google"
        onPress={handleGoogleSignIn}
        testID="sign-up-google"
      />

      {/* Footer */}
      <AuthFooterLink
        prefix="Already have an account?"
        linkLabel="Sign In"
        onPress={() => router.replace("/auth/sign-in")}
        testID="sign-up-to-signin"
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
