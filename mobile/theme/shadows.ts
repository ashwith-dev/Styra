import type { ViewStyle } from "react-native";

type Shadow = Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
>;

/**
 * Global Neumorphic & subtle shadow design system definitions.
 */
export const shadows = {
  small: {
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  large: {
    shadowColor: "#000000",
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },

  /** Global Neumorphic Preset definitions */
  neumorphicSubtle: {
    backgroundColor: "#F7F5F0",
    borderRadius: 18,
    borderWidth: 0,
    boxShadow: "-6px -6px 16px #FFFFFF, 6px 6px 16px rgba(185, 175, 158, 0.65)",
    shadowColor: "#000000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  } as ViewStyle & { boxShadow?: string },

  neumorphicRaised: {
    backgroundColor: "#F7F5F0",
    borderRadius: 24,
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
} as const satisfies Record<string, Shadow>;

export type ShadowKey = keyof typeof shadows;
export type ShadowValue = (typeof shadows)[ShadowKey];
