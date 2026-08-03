import { useEffect, useState } from "react";
import { View, Image, Text, StyleSheet, type ImageStyle } from "react-native";
import { colors, fontSize } from "../../lib/theme";

interface CachedImageProps {
  uri: string | null | undefined;
  style: ImageStyle;
  resizeMode?: "cover" | "contain" | "stretch";
  placeholder?: string;
  accessibilityLabel?: string;
}

export function CachedImage({
  uri,
  style,
  resizeMode = "cover",
  placeholder = "📷",
  accessibilityLabel,
}: CachedImageProps) {
  const [failed, setFailed] = useState(!uri);

  // Reset when the uri changes (e.g. null → loaded) so a previously
  // failed/empty render doesn't get stuck on the placeholder.
  useEffect(() => {
    setFailed(!uri);
  }, [uri]);

  if (failed || !uri) {
    return (
      <View style={[style, styles.placeholder]}>
        <Text style={styles.placeholderText}>{placeholder}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  placeholderText: {
    fontSize: fontSize.xxl,
  },
});
