import { Stack } from "expo-router";

export default function ItemsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{ title: "Item Detail", headerShown: true }}
      />
    </Stack>
  );
}
