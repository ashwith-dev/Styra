import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/Avatar";
import { colors, spacing } from "@/theme";

interface WardrobeScreenHeaderProps {
  userAvatar?: string | null;
  userName?: string;
  onSearchPress?: () => void;
  onAvatarPress?: () => void;
}

export function WardrobeScreenHeader({
  userAvatar,
  userName = "Alex",
  onSearchPress,
  onAvatarPress,
}: WardrobeScreenHeaderProps) {
  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else {
      router.push("/profile");
    }
  };

  return (
    <View style={styles.header}>
      {/* Left: High-Contrast Serif STYRA Logo */}
      <Text style={styles.logoText}>STYRA</Text>

      {/* Right: Search Icon + Profile Avatar */}
      <View style={styles.rightGroup}>
        {onSearchPress && (
          <TouchableOpacity
            onPress={onSearchPress}
            style={styles.searchBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Search wardrobe"
            testID="wardrobe-search-icon"
          >
            <Ionicons name="search-outline" size={18} color="#1A1A1A" />
          </TouchableOpacity>
        )}
        <Avatar
          uri={userAvatar}
          name={userName}
          size="md"
          onPress={handleAvatarPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logoText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 3,
    color: "#000000",
    textTransform: "uppercase",
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F4F1EA",
    alignItems: "center",
    justifyContent: "center",
  },
});
