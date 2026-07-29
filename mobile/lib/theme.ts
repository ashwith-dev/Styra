/**
 * Backward-compatible theme re-exports.
 *
 * This file bridges the old `lib/theme.ts` property names to the canonical
 * design tokens in `theme/`. New code should import from `theme/` directly.
 *
 * Mappings:
 *   colors.text       → colors.textPrimary
 *   colors.primary    → colors.textPrimary
 *   colors.link       → colors.accent
 *   colors.errorBackground → custom alias (defined below)
 *   colors.borderLight    → colors.border
 *   fontSize.*        → typography.* (approximate)
 *   borderRadius.*    → radius.*
 *   fontWeight.*      → fontWeight from theme/
 *   shadows.*         → shadows from theme/
 */

import { colors as themeColors } from "../theme/colors";
import { spacing as themeSpacing } from "../theme/spacing";
import { typography, fontWeight } from "../theme/typography";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";

/** Backward-compatible color aliases. */
export const colors = {
  ...themeColors,
  /** @deprecated Use colors.textPrimary */
  text: themeColors.textPrimary,
  /** @deprecated Use colors.textPrimary */
  primary: themeColors.textPrimary,
  /** @deprecated Use colors.accent */
  link: themeColors.accent,
  /** @deprecated Use colors.border */
  borderLight: themeColors.border,
  /** Error background (not in theme/ — kept for compatibility) */
  errorBackground: "#FFF5F5",
  /** @deprecated Not used in production code */
  primaryDisabled: "#999999",
  surfaceElevated: "#FFFFFF",
  textTertiary: "#999999",
  overlay: "rgba(0, 0, 0, 0.4)",
} as const;

/** @deprecated Use spacing from theme/ */
export const spacing = themeSpacing;

/**
 * @deprecated Use typography from theme/ for full text styles,
 * or use font sizing from individual style presets.
 *
 * Approximate mapping to keep old code working:
 *   fontSize.xs  → typography.caption (14px)
 *   fontSize.sm  → typography.caption (14px)
 *   fontSize.md  → typography.body (16px)
 *   fontSize.lg  → typography.h3 (20px)
 *   fontSize.xl  → typography.h2 (24px)
 *   fontSize.xxl → typography.h1 or display (28-36px)
 */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export { fontWeight };

/** @deprecated Use radius from theme/ */
export const borderRadius = radius;

export { shadows };
