import { Stack } from "expo-router";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";

export default function OutfitsLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="generate" />
        <Stack.Screen name="history" />
      </Stack>
    </ErrorBoundary>
  );
}
