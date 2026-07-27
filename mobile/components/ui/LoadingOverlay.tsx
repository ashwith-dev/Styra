import { View, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../../lib/theme";

interface LoadingOverlayProps {
  visible: boolean;
}

export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  container: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 16,
    padding: 24,
  },
});
