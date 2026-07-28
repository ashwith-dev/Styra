import type { ViewStyle } from "react-native";
import { Platform } from "react-native";

type Shadow = Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
>;

const iosOnly = Platform.OS === "ios";

/**
 * Subtle, premium shadows. Android elevation kept low to avoid
 * Material-like heaviness.
 */
export const shadows = {
  small: {
    shadowColor: "#141412",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: "#141412",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: "#141412",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
} as const satisfies Record<string, Shadow>;

export type ShadowKey = keyof typeof shadows;
export type ShadowValue = (typeof shadows)[ShadowKey];
