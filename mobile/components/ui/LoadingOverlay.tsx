import { View, ActivityIndicator, StyleSheet } from "react-native";


/** Semi-transparent scrim — not a brand token, so defined locally. */
const OVERLAY_BG = "rgba(0, 0, 0, 0.4)";

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
    backgroundColor: OVERLAY_BG,
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
