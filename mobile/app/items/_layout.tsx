import { Stack } from "expo-router";
import { colors } from "../../lib/theme";

export default function ItemsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{ title: "Item Detail", headerBackTitle: "Wardrobe" }}
      />
    </Stack>
  );
}
