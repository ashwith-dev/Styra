import { Platform, type ViewStyle } from "react-native";

/**
 * STYRA Home Screen Neumorphic Design Tokens.
 * Based on dual-shadow Neumorphic implementation:
 * - Top-Left: Pure White Light Shadow (-8px -8px 20px #FFFFFF)
 * - Bottom-Right: Soft Dark Warm Shadow (8px 8px 20px rgba(185, 175, 158, 0.7))
 *
 * Scoped strictly to features/home to avoid global regressions.
 */
export const homeTokens = {
  background: "#F7F5F0",
  surface: "#F7F5F0",
  darkAccent: "#141412",
  textPrimary: "#141412",
  textSecondary: "#7F7C76",
  
  shadowDark: "rgba(185, 175, 158, 0.7)",
  shadowLight: "#FFFFFF",
} as const;

/**
 * Reusable cross-platform Neumorphic style presets with dual box-shadow definitions.
 */
export const neumorphicStyles = {
  /** Subtle raised depth: -8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7) */
  subtle: {
    backgroundColor: homeTokens.surface,
    borderRadius: 20,
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },

  /** Standard raised depth for main content cards and secondary buttons */
  raised: {
    backgroundColor: homeTokens.surface,
    borderRadius: 26,
    borderWidth: 0,
    boxShadow: "-10px -10px 24px #FFFFFF, 10px 10px 24px rgba(180, 170, 152, 0.75)",
    shadowColor: "#000000",
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  } as ViewStyle & { boxShadow?: string },

  /** Dark primary action button elevation */
  elevatedDark: {
    backgroundColor: homeTokens.darkAccent,
    borderRadius: 9999,
    boxShadow: "0px 8px 20px rgba(20, 20, 18, 0.35)",
    shadowColor: homeTokens.darkAccent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  } as ViewStyle & { boxShadow?: string },

  /** Pressed / Inset tactile state (150ms press transition) */
  pressed: {
    backgroundColor: "#F0ECE2",
    borderRadius: 16,
    borderWidth: 0,
    boxShadow: "inset 3px 3px 7px rgba(180, 170, 152, 0.7), inset -3px -3px 7px #FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  } as ViewStyle & { boxShadow?: string },
};
