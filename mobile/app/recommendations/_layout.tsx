import { Stack } from "expo-router";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";

export default function RecommendationsLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ErrorBoundary>
  );
}
