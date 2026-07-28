import { View, StyleSheet, type ViewStyle } from "react-native";
import { colors } from "@/theme";

interface DividerProps {
  testID?: string;
  style?: ViewStyle;
}

export function Divider({ testID, style }: DividerProps) {
  return <View testID={testID} style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
