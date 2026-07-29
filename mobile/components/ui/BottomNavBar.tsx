import { StyleSheet, TouchableOpacity, View } from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius, spacing } from "@/theme";

export type TabKey = "home" | "wardrobe" | "looks" | "profile";

interface BottomNavBarProps {
  activeTab?: TabKey;
}

export function BottomNavBar({ activeTab = "home" }: BottomNavBarProps) {
  const pathname = usePathname();

  const currentActive =
    activeTab ||
    (pathname.includes("/wardrobe")
      ? "wardrobe"
      : pathname.includes("/looks")
      ? "looks"
      : pathname.includes("/profile")
      ? "profile"
      : "home");

  const handleNav = (tab: TabKey) => {
    switch (tab) {
      case "home":
        router.push("/home");
        break;
      case "wardrobe":
        router.push("/wardrobe");
        break;
      case "looks":
        router.push("/looks");
        break;
      case "profile":
        router.push("/profile");
        break;
    }
  };

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.pillContainer}>
        {/* Tab 1: Home */}
        <TouchableOpacity
          onPress={() => handleNav("home")}
          style={styles.tabBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Home"
          testID="nav-tab-home"
        >
          <View style={[styles.iconWrapper, currentActive === "home" && styles.activeIconWrapper]}>
            <Ionicons
              name={currentActive === "home" ? "home" : "home-outline"}
              size={22}
              color={currentActive === "home" ? colors.surface : "#55524D"}
            />
          </View>
        </TouchableOpacity>

        {/* Tab 2: Your Wardrobe (Hanger Symbol matching Image 2) */}
        <TouchableOpacity
          onPress={() => handleNav("wardrobe")}
          style={styles.tabBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Your Wardrobe"
          testID="nav-tab-wardrobe"
        >
          <View style={[styles.iconWrapper, currentActive === "wardrobe" && styles.activeIconWrapper]}>
            <MaterialCommunityIcons
              name="hanger"
              size={24}
              color={currentActive === "wardrobe" ? colors.surface : "#55524D"}
            />
          </View>
        </TouchableOpacity>

        {/* Tab 3: Saved Outfits / Looks */}
        <TouchableOpacity
          onPress={() => handleNav("looks")}
          style={styles.tabBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Saved Outfits"
          testID="nav-tab-looks"
        >
          <View style={[styles.iconWrapper, currentActive === "looks" && styles.activeIconWrapper]}>
            <Ionicons
              name={currentActive === "looks" ? "bookmark" : "bookmark-outline"}
              size={22}
              color={currentActive === "looks" ? colors.surface : "#55524D"}
            />
          </View>
        </TouchableOpacity>

        {/* Tab 4: Profile */}
        <TouchableOpacity
          onPress={() => handleNav("profile")}
          style={styles.tabBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          testID="nav-tab-profile"
        >
          <View style={[styles.iconWrapper, currentActive === "profile" && styles.activeIconWrapper]}>
            <Ionicons
              name={currentActive === "profile" ? "person" : "person-outline"}
              size={22}
              color={currentActive === "profile" ? colors.surface : "#55524D"}
            />
          </View>
        </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.surface,
    height: 64,
    width: "100%",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconWrapper: {
    backgroundColor: colors.textPrimary,
  },
});
