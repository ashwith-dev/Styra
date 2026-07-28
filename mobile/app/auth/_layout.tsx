import { Stack } from "expo-router";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";

/**
 * Auth stack navigator.
 * All screens share headerShown: false so auth screens control their own chrome.
 */
export default function AuthLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="verify-email" />
      </Stack>
    </ErrorBoundary>
  );
}
