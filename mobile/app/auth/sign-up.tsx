import { useState } from "react";
import {
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { Button, Input } from "../../components/ui";
import { colors, fontSize, fontWeight, spacing } from "../../lib/theme";

export default function SignUp() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await signUp(email, password);
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      Alert.alert(
        "Check your email",
        "We sent you a confirmation link. You can sign in once verified.",
      );
      router.push("/auth/sign-in");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Add your wardrobe in minutes</Text>

      <Input
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={(t) => { setEmail(t); setError(null); }}
        keyboardType="email-address"
        autoComplete="email"
      />

      <Input
        label="Password"
        placeholder="At least 6 characters"
        value={password}
        onChangeText={(t) => { setPassword(t); setError(null); }}
        secureTextEntry
        autoComplete="new-password"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        label={loading ? "Creating account..." : "Sign Up"}
        onPress={handleSignUp}
        loading={loading}
        disabled={loading}
      />

      <Button
        label="Already have an account? Sign In"
        onPress={() => router.push("/auth/sign-in")}
        variant="ghost"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xxl,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.md,
  },
});
