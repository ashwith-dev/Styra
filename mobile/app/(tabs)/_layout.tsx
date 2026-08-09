import { Tabs } from "expo-router";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { BottomNavBar } from "@/components/ui/BottomNavBar";

export default function MainTabsLayout() {
  return (
    <ErrorBoundary>
      <Tabs
        tabBar={(props) => <BottomNavBar {...props} />}
        screenOptions={{
          headerShown: false,
          lazy: false,
          animation: "fade",
          transitionSpec: {
            animation: "timing",
            config: {
              duration: 220,
            },
          },
          sceneStyle: { backgroundColor: "#F7F5F0" },
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="wardrobe" />
        <Tabs.Screen name="looks" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </ErrorBoundary>
  );
}
