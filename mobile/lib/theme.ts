export const colors = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  surfaceElevated: "#FFFFFF",
  primary: "#000000",
  primaryDisabled: "#999999",
  text: "#000000",
  textSecondary: "#666666",
  textTertiary: "#999999",
  border: "#DDDDDD",
  borderLight: "#F0F0F0",
  error: "#DC3545",
  errorBackground: "#FFF5F5",
  link: "#007AFF",
  overlay: "rgba(0, 0, 0, 0.4)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
} as const;
