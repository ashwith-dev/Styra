import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageStyle,
  type ViewStyle,
} from "react-native";
import { colors, typography } from "@/theme";

type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
};

const fontSizeMap: Record<AvatarSize, number> = {
  sm: 14,
  md: 18,
  lg: 26,
  xl: 38,
};

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: AvatarSize;
  testID?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Avatar({
  uri,
  name,
  size = "md",
  testID,
  style,
  onPress,
}: AvatarProps) {
  const dimension = sizeMap[size];
  const half = dimension / 2;

  const content = uri ? (
    <Image
      testID={testID}
      source={{ uri }}
      style={[{ width: dimension, height: dimension, borderRadius: half }, style as ImageStyle]}
      accessibilityLabel={name ? `${name}'s avatar` : "Avatar"}
    />
  ) : (
    <View
      testID={testID}
      style={[
        styles.initialsContainer,
        {
          width: dimension,
          height: dimension,
          borderRadius: half,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: fontSizeMap[size] }]}>
        {getInitials(name)}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={name ? `Open profile for ${name}` : "Open profile"}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  initialsContainer: {
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    ...typography.h2,
    color: colors.textSecondary,
  },
});
