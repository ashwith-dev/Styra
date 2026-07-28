export const colors = {
  background: "#FAF8F5",
  surface: "#FFFFFF",
  textPrimary: "#141412",
  textSecondary: "#787571",
  accent: "#C86D51",
  border: "#EFECE6",
  success: "#3F7D58",
  warning: "#D18B2F",
  error: "#C84B4B",
} as const;

export type ColorKey = keyof typeof colors;
export type ColorValue = (typeof colors)[ColorKey];
