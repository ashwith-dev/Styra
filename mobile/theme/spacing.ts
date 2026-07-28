export const spacing = {
  /** 4px */
  xxs: 4,
  /** 8px */
  xs: 8,
  /** 12px */
  sm: 12,
  /** 16px */
  md: 16,
  /** 20px */
  lg: 20,
  /** 24px */
  xl: 24,
  /** 32px */
  xxl: 32,
  /** 40px */
  xxxl: 40,
  /** 48px */
  huge: 48,
  /** 64px */
  massive: 64,
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingValue = (typeof spacing)[SpacingKey];
