import { Stack } from "expo-router";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

/**
 * Home stack navigator layout.
 * Custom STYRA header chrome rendered by home screen directly.
 */
export default function HomeLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ErrorBoundary>
  );
}
