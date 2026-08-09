import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  type LayoutChangeEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { router, usePathname } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { radius, spacing } from "@/theme";

export type TabKey = "home" | "wardrobe" | "looks" | "profile";

const TABS: { key: TabKey; label: string; routeName: string }[] = [
  { key: "home", label: "Home", routeName: "home" },
  { key: "wardrobe", label: "Your Wardrobe", routeName: "wardrobe" },
  { key: "looks", label: "Saved Outfits", routeName: "looks" },
  { key: "profile", label: "Profile", routeName: "profile" },
];

const TAB_INDEX_MAP: Record<TabKey, number> = {
  home: 0,
  wardrobe: 1,
  looks: 2,
  profile: 3,
};

// Module-level persistent tab tracker so the active indicator position is preserved
let globalLastTabIndex = 0;

interface BottomNavBarProps {
  activeTab?: TabKey;
  state?: BottomTabBarProps["state"];
  navigation?: BottomTabBarProps["navigation"];
}

export function BottomNavBar({ activeTab, state, navigation }: BottomNavBarProps) {
  const pathname = usePathname();

  // Determine active tab index
  let activeIndex = 0;
  if (typeof state?.index === "number") {
    activeIndex = state.index;
  } else if (activeTab) {
    activeIndex = TAB_INDEX_MAP[activeTab] ?? 0;
  } else {
    if (pathname.includes("/wardrobe")) activeIndex = 1;
    else if (pathname.includes("/looks")) activeIndex = 2;
    else if (pathname.includes("/profile")) activeIndex = 3;
    else activeIndex = 0;
  }

  const [containerWidth, setContainerWidth] = useState(0);

  // Persistent animated tab index value (0 -> 1 -> 2 -> 3)
  const tabProgressAnim = useRef(new Animated.Value(globalLastTabIndex)).current;
  const slideAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const indicatorStretchAnim = useRef(new Animated.Value(1)).current;
  const stretchAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Scale anim for active icon (1.0 -> 1.04)
  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  const iconAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    slideAnimationRef.current?.stop();
    stretchAnimationRef.current?.stop();
    iconAnimationRef.current?.stop();

    const travelDistance = Math.abs(activeIndex - globalLastTabIndex);
    const stretchTarget = 1 + Math.min(travelDistance, 3) * 0.22;

    // Smooth UI spring animation for sliding indicator
    slideAnimationRef.current = Animated.spring(tabProgressAnim, {
      toValue: activeIndex,
      stiffness: 170,
      damping: 30,
      mass: 0.9,
      overshootClamping: true,
      useNativeDriver: true,
    });
    indicatorStretchAnim.setValue(1);
    stretchAnimationRef.current = Animated.sequence([
      Animated.timing(indicatorStretchAnim, {
        toValue: stretchTarget,
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(indicatorStretchAnim, {
        toValue: 1,
        duration: 210,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    // Subtle scale transition for active icon (1.04) without dramatic bounce
    iconScaleAnim.setValue(1);
    iconAnimationRef.current = Animated.sequence([
      Animated.timing(iconScaleAnim, {
        toValue: 1.035,
        duration: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(iconScaleAnim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    slideAnimationRef.current.start(({ finished }) => {
      if (finished) {
        globalLastTabIndex = activeIndex;
        slideAnimationRef.current = null;
      }
    });
    stretchAnimationRef.current.start(({ finished }) => {
      if (finished) {
        stretchAnimationRef.current = null;
      }
    });
    iconAnimationRef.current.start(({ finished }) => {
      if (finished) {
        iconAnimationRef.current = null;
      }
    });

    return () => {
      slideAnimationRef.current?.stop();
      stretchAnimationRef.current?.stop();
      iconAnimationRef.current?.stop();
      globalLastTabIndex = activeIndex;
    };
  }, [activeIndex, iconScaleAnim, indicatorStretchAnim, tabProgressAnim]);

  const handleNav = (tab: TabKey, routeName: string) => {
    globalLastTabIndex = activeIndex;

    if (navigation && state) {
      const route = state.routes.find((r) => r.name === routeName);
      if (route) {
        navigation.navigate(route.name);
        return;
      }
    }

    switch (tab) {
      case "home":
        router.replace("/home");
        break;
      case "wardrobe":
        router.replace("/wardrobe");
        break;
      case "looks":
        router.replace("/looks");
        break;
      case "profile":
        router.replace("/profile");
        break;
    }
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  // Compute horizontal translateX for dark sliding indicator
  const paddingHorizontal = 16;
  const availableWidth = containerWidth > 0 ? containerWidth - paddingHorizontal * 2 : 0;
  const tabStepWidth = availableWidth / 4;
  const indicatorSize = 44; // size of dark circle

  const translateX = tabProgressAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [
      paddingHorizontal + (tabStepWidth - indicatorSize) / 2,
      paddingHorizontal + tabStepWidth + (tabStepWidth - indicatorSize) / 2,
      paddingHorizontal + tabStepWidth * 2 + (tabStepWidth - indicatorSize) / 2,
      paddingHorizontal + tabStepWidth * 3 + (tabStepWidth - indicatorSize) / 2,
    ],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.pillContainer} onLayout={handleLayout}>
        {/* Sliding Dark Active Indicator */}
        {containerWidth > 0 && (
          <Animated.View
            style={[
              styles.slidingIndicator,
              {
                width: indicatorSize,
                height: indicatorSize,
                borderRadius: indicatorSize / 2,
                transform: [{ translateX }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.slidingIndicatorFill,
                {
                  borderRadius: indicatorSize / 2,
                  transform: [{ scaleX: indicatorStretchAnim }],
                },
              ]}
            />
          </Animated.View>
        )}

        {/* Tab Buttons */}
        {TABS.map((tabObj, idx) => {
          const isActive = activeIndex === idx;
          const animatedIconScale = tabProgressAnim.interpolate({
            inputRange: [idx - 1, idx, idx + 1],
            outputRange: [1, 1.03, 1],
            extrapolate: "clamp",
          });
          const inactiveIconOpacity = tabProgressAnim.interpolate({
            inputRange: [idx - 0.45, idx, idx + 0.45],
            outputRange: [1, 0, 1],
            extrapolate: "clamp",
          });
          const activeIconOpacity = tabProgressAnim.interpolate({
            inputRange: [idx - 0.45, idx, idx + 0.45],
            outputRange: [0, 1, 0],
            extrapolate: "clamp",
          });
          const iconScale = isActive
            ? Animated.multiply(animatedIconScale, iconScaleAnim)
            : animatedIconScale;

          return (
            <TouchableOpacity
              key={tabObj.key}
              onPress={() => handleNav(tabObj.key, tabObj.routeName)}
              style={styles.tabBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={tabObj.label}
              testID={`nav-tab-${tabObj.key}`}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  { transform: [{ scale: iconScale }] },
                ]}
              >
                {tabObj.key === "home" && (
                  <>
                    <Animated.View style={{ opacity: inactiveIconOpacity }}>
                      <Ionicons name="home-outline" size={22} color="#7F7C76" />
                    </Animated.View>
                    <Animated.View style={[styles.activeIconLayer, { opacity: activeIconOpacity }]}>
                      <Ionicons name="home" size={22} color="#FFFFFF" />
                    </Animated.View>
                  </>
                )}

                {tabObj.key === "wardrobe" && (
                  <>
                    <Animated.View style={{ opacity: inactiveIconOpacity }}>
                      <MaterialCommunityIcons name="hanger" size={24} color="#7F7C76" />
                    </Animated.View>
                    <Animated.View style={[styles.activeIconLayer, { opacity: activeIconOpacity }]}>
                      <MaterialCommunityIcons name="hanger" size={24} color="#FFFFFF" />
                    </Animated.View>
                  </>
                )}

                {tabObj.key === "looks" && (
                  <>
                    <Animated.View style={{ opacity: inactiveIconOpacity }}>
                      <Ionicons name="bookmark-outline" size={22} color="#7F7C76" />
                    </Animated.View>
                    <Animated.View style={[styles.activeIconLayer, { opacity: activeIconOpacity }]}>
                      <Ionicons name="bookmark" size={22} color="#FFFFFF" />
                    </Animated.View>
                  </>
                )}

                {tabObj.key === "profile" && (
                  <>
                    <Animated.View style={{ opacity: inactiveIconOpacity }}>
                      <Ionicons name="person-outline" size={22} color="#7F7C76" />
                    </Animated.View>
                    <Animated.View style={[styles.activeIconLayer, { opacity: activeIconOpacity }]}>
                      <Ionicons name="person" size={22} color="#FFFFFF" />
                    </Animated.View>
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    bottom: 24,
    left: spacing.xl,
    right: spacing.xl,
    alignItems: "center",
    zIndex: 999,
  },
  pillContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F5F0",
    height: 64,
    width: "100%",
    borderRadius: radius.full,
    paddingHorizontal: 16,
    borderWidth: Platform.OS === "ios" ? 1.2 : 0.8,
    borderColor: "rgba(255, 255, 255, 0.9)",
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 6,
  } as ViewStyle & { boxShadow?: string },
  slidingIndicator: {
    position: "absolute",
    top: 10,
    left: 0,
    zIndex: 1,
  },
  slidingIndicatorFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "#141412",
    boxShadow: "0px 4px 12px rgba(20, 20, 18, 0.35)",
    shadowColor: "#141412",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    zIndex: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconLayer: {
    position: "absolute",
  },
});
