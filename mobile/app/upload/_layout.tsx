import { Stack } from "expo-router";
import { colors } from "../../lib/theme";

export default function UploadLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="capture"
        options={{ title: "Add Item", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="review"
        options={{ title: "Review", headerBackTitle: "Back" }}
      />
    </Stack>
  );
}
