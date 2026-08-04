/**
 * permissionConstants.ts
 * All user-facing strings, API endpoints, and configuration values for the
 * location and notification permission flows. Nothing is hardcoded in
 * components or hooks — everything comes from here.
 */

// ─── Weather API ─────────────────────────────────────────────────────────────

export const WEATHER_API_BASE_URL = "https://api.open-meteo.com/v1/forecast";
export const WEATHER_FETCH_TIMEOUT_MS = 10_000; // 10 seconds

// ─── Location ────────────────────────────────────────────────────────────────

export const LOCATION_TIMEOUT_MS = 15_000; // 15 seconds GPS acquisition timeout

export const LOCATION_DENIED_DIALOG = {
  title: "Location Permission Required",
  message:
    "Location helps STYRA automatically recommend weather-appropriate outfits. " +
    "You can continue without it by selecting the season manually.",
  primaryLabel: "Open Settings",
  secondaryLabel: "Maybe Later",
} as const;

// ─── Notifications ────────────────────────────────────────────────────────────

export const NOTIFICATION_DENIED_DIALOG = {
  title: "Notifications Disabled",
  message:
    "You won't receive daily outfit suggestions, weather alerts, or wardrobe reminders. " +
    "You can enable notifications anytime from Settings.",
  primaryLabel: "Open Settings",
  secondaryLabel: "Maybe Later",
} as const;

// ─── WMO Weather Codes → Condition strings ───────────────────────────────────
// https://open-meteo.com/en/docs — WMO Weather interpretation codes (WW)

export const WMO_CODE_MAP: Record<number, { condition: string; icon: string }> = {
  0:  { condition: "Clear Sky",     icon: "sunny-outline" },
  1:  { condition: "Mainly Clear",  icon: "sunny-outline" },
  2:  { condition: "Partly Cloudy", icon: "partly-sunny-outline" },
  3:  { condition: "Overcast",      icon: "cloudy-outline" },
  45: { condition: "Foggy",         icon: "cloudy-outline" },
  48: { condition: "Foggy",         icon: "cloudy-outline" },
  51: { condition: "Light Drizzle", icon: "rainy-outline" },
  53: { condition: "Drizzle",       icon: "rainy-outline" },
  55: { condition: "Heavy Drizzle", icon: "rainy-outline" },
  56: { condition: "Freezing Drizzle", icon: "rainy-outline" },
  57: { condition: "Freezing Drizzle", icon: "rainy-outline" },
  61: { condition: "Light Rain",    icon: "rainy-outline" },
  63: { condition: "Rainy",         icon: "rainy-outline" },
  65: { condition: "Heavy Rain",    icon: "thunderstorm-outline" },
  66: { condition: "Freezing Rain", icon: "rainy-outline" },
  67: { condition: "Freezing Rain", icon: "rainy-outline" },
  71: { condition: "Light Snow",    icon: "snow-outline" },
  73: { condition: "Snowy",         icon: "snow-outline" },
  75: { condition: "Heavy Snow",    icon: "snow-outline" },
  77: { condition: "Snow Grains",   icon: "snow-outline" },
  80: { condition: "Light Showers", icon: "rainy-outline" },
  81: { condition: "Rainy",         icon: "rainy-outline" },
  82: { condition: "Heavy Showers", icon: "thunderstorm-outline" },
  85: { condition: "Snow Showers",  icon: "snow-outline" },
  86: { condition: "Snow Showers",  icon: "snow-outline" },
  95: { condition: "Thunderstorm",  icon: "thunderstorm-outline" },
  96: { condition: "Thunderstorm",  icon: "thunderstorm-outline" },
  99: { condition: "Thunderstorm",  icon: "thunderstorm-outline" },
};

export const DEFAULT_WEATHER_ENTRY: { condition: string; icon: string } = {
  condition: "Unknown",
  icon: "cloud-outline",
};
