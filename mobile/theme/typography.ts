import type { TextStyle } from "react-native";

const headingFontFamily: TextStyle["fontFamily"] = "Playfair Display";
const bodyFontFamily: TextStyle["fontFamily"] = "Inter";
const monoFontFamily: TextStyle["fontFamily"] = "SF Mono";

/**
 * Type-safe text style presets.
 * Spreading these into a StyleSheet.create or inline style is safe —
 * React Native ignores extra keys not in TextStyle.
 */

export const typography = {
  display: {
    fontFamily: headingFontFamily,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "400",
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: headingFontFamily,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "400",
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: headingFontFamily,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "400",
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: headingFontFamily,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  bodyLarge: {
    fontFamily: bodyFontFamily,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "400",
  },
  body: {
    fontFamily: bodyFontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  caption: {
    fontFamily: bodyFontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  label: {
    fontFamily: bodyFontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  button: {
    fontFamily: bodyFontFamily,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  mono: {
    fontFamily: monoFontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyKey = keyof typeof typography;

/** Font weight presets for ad-hoc use. */
export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};
