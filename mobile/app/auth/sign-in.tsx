import { useState } from "react";
import {
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { Button, Input } from "../../components/ui";
import { colors, fontSize, fontWeight, spacing } from "../../lib/theme";

export default function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: authError } = await signIn(email, password);
    setLoading(false);

    if (authError) {
      if (authError.message.includes("Invalid login credentials")) {
        setError("Invalid email or password.");
      } else {
        setError(authError.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Wardrobe</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <Input
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={(t) => { setEmail(t); setError(null); }}
        keyboardType="email-address"
        autoComplete="email"
        returnKeyType="next"
      />

      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={(t) => { setPassword(t); setError(null); }}
        secureTextEntry
        autoComplete="password"
        returnKeyType="go"
        onSubmitEditing={handleSignIn}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        label={loading ? "Signing in..." : "Sign In"}
        onPress={handleSignIn}
        loading={loading}
        disabled={loading}
      />

      <Button
        label="Don't have an account? Sign Up"
        onPress={() => router.push("/auth/sign-up")}
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
