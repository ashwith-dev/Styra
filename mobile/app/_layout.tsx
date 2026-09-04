import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { ErrorBoundary } from "../components/ui";
import { validateEnv } from "../lib/env";
import { colors } from "../lib/theme";

// Validate required env vars at app startup. If missing we show a clear
// developer-facing error instead of an obscure runtime crash.
validateEnv();

function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 280,
        contentStyle: { backgroundColor: "#F7F5F0" },
      }}
    >
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" redirect={!session} options={{ animation: "none" }} />
      <Stack.Screen name="onboarding" redirect={!session} />
      <Stack.Screen name="recommendations" redirect={!session} />
      <Stack.Screen name="outfits" redirect={!session} />
      <Stack.Screen name="upload" redirect={!session} />
      <Stack.Screen name="items" redirect={!session} />
      <Stack.Screen name="settings/index" redirect={!session} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
