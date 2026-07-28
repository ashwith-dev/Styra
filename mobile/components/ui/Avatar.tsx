import { View, Text, Image, StyleSheet, type ViewStyle, type ImageStyle } from "react-native";
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
}

export function Avatar({
  uri,
  name,
  size = "md",
  testID,
  style,
}: AvatarProps) {
  const dimension = sizeMap[size];
  const half = dimension / 2;

  if (uri) {
    const imageStyle: ImageStyle = {
      width: dimension,
      height: dimension,
      borderRadius: half,
    };

    return (
      <Image
        testID={testID}
        source={{ uri }}
        style={[imageStyle, style as ImageStyle]}
        accessibilityLabel={name ? `${name}'s avatar` : "Avatar"}
      />
    );
  }

  return (
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
