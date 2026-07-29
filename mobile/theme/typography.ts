import { Platform, type TextStyle } from "react-native";

const headingFontFamily: TextStyle["fontFamily"] = "serif";
const bodyFontFamily: TextStyle["fontFamily"] = "Inter";
const monoFontFamily: TextStyle["fontFamily"] = "SF Mono";

/**
 * Type-safe text style presets.
 * High-contrast editorial serif for brand headers and luxury styling.
 */

export const typography = {
  brandLogo: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 4,
    textTransform: "uppercase",
    color: "#000000",
  },
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
