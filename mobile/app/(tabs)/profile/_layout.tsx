import { Stack } from "expo-router";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

/**
 * Profile stack navigator layout.
 * Custom STYRA header chrome rendered by screens directly.
 */
export default function ProfileLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ErrorBoundary>
  );
}
