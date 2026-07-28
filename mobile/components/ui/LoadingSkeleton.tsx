import { View, StyleSheet, type ViewStyle } from "react-native";
import { colors, radius } from "@/theme";

const PULSE_COLOR = colors.border;

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function LoadingSkeleton({
  width = "100%",
  height = 16,
  borderRadius = radius.sm,
  style,
}: LoadingSkeletonProps) {
  return (
    <View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: PULSE_COLOR },
        style,
      ]}
    />
  );
}

/** Pre-composed skeleton blocks for common layouts. */
export function LoadingSkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <LoadingSkeleton height={200} borderRadius={radius.md} />
      <View style={styles.cardBody}>
        <LoadingSkeleton width="60%" height={18} />
        <LoadingSkeleton width="40%" height={14} />
      </View>
    </View>
  );
}

export function LoadingSkeletonRow({
  lines = 3,
  style,
}: {
  lines?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          width={i === lines - 1 ? "70%" : "100%"}
          height={14}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  cardBody: {
    gap: 8,
  },
  row: {
    gap: 10,
  },
});
