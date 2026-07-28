export const radius = {
  /** 12px — cards, inputs */
  sm: 12,
  /** 16px — buttons, containers */
  md: 16,
  /** 24px — modals, sheets */
  lg: 24,
  /** 32px — prominent surfaces */
  xl: 32,
  /** 9999px — pill / fully rounded */
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radius;
export type RadiusValue = (typeof radius)[RadiusKey];
