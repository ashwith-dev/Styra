import { Stack } from "expo-router";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";

/**
 * Saved Looks stack navigator layout.
 * Custom STYRA header chrome rendered by screens directly.
 */
export default function LooksLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[id]" />
        <Stack.Screen name="create" />
        <Stack.Screen name="edit" />
      </Stack>
    </ErrorBoundary>
  );
}
