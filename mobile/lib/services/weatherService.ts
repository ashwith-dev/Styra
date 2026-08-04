/**
 * weatherService.ts
 * Fetches live weather data from the Open-Meteo API using GPS coordinates.
 * https://open-meteo.com/en/docs
 *
 * No API key required. No hardcoded values — all configuration lives in
 * permissionConstants.ts.
 */

import {
  DEFAULT_WEATHER_ENTRY,
  WEATHER_API_BASE_URL,
  WEATHER_FETCH_TIMEOUT_MS,
  WMO_CODE_MAP,
} from "./permissionConstants";

export interface WeatherData {
  /** Temperature in Celsius */
  temperatureCelsius: number;
  /** Formatted display string, e.g. "22°C" or "72°F" */
  temperatureDisplay: string;
  /** Human-readable condition, e.g. "Sunny", "Rainy" */
  condition: string;
  /** Ionicons icon name matching the condition */
  icon: string;
  /** Derived season: "Spring" | "Summer" | "Autumn" | "Winter" */
  season: string;
  /** Latitude used for the fetch */
  latitude: number;
  /** Longitude used for the fetch */
  longitude: number;
}

/**
 * Fetches weather for the given GPS coordinates.
 * Returns null if the API is unreachable, times out, or returns invalid data.
 *
 * @param latitude  GPS latitude
 * @param longitude GPS longitude
 * @param unit      "celsius" (default) | "fahrenheit"
 */
export async function fetchWeatherByCoords(
  latitude: number,
  longitude: number,
  unit: "celsius" | "fahrenheit" = "celsius",
): Promise<WeatherData | null> {
  try {
    const url = buildUrl(latitude, longitude, unit);

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      WEATHER_FETCH_TIMEOUT_MS,
    );

    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) return null;

    const json = (await response.json()) as OpenMeteoResponse;

    const current = json?.current_weather;
    if (!current) return null;

    const temperatureCelsius = current.temperature; // always Celsius from API
    const weatherCode = current.weathercode;

    const { condition, icon } =
      WMO_CODE_MAP[weatherCode] ?? DEFAULT_WEATHER_ENTRY;

    const displayTemp =
      unit === "fahrenheit"
        ? `${celsiusToFahrenheit(temperatureCelsius)}°F`
        : `${Math.round(temperatureCelsius)}°C`;

    const season = deriveSeason(latitude);

    return {
      temperatureCelsius: Math.round(temperatureCelsius),
      temperatureDisplay: displayTemp,
      condition,
      icon,
      season,
      latitude,
      longitude,
    };
  } catch {
    // Network error, parse error, abort — always return null, never throw
    return null;
  }
}

// ─── Private helpers ──────────────────────────────────────────────────────────

interface OpenMeteoResponse {
  current_weather?: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    time: string;
  };
}

function buildUrl(
  latitude: number,
  longitude: number,
  unit: "celsius" | "fahrenheit",
): string {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current_weather: "true",
    // We always request Celsius and convert locally so the raw
    // temperatureCelsius field is always in °C regardless of display unit.
    temperature_unit: "celsius",
    windspeed_unit: "kmh",
    timezone: "auto",
  });
  // Suppress the unused-variable warning; unit is used to format display
  void unit;
  return `${WEATHER_API_BASE_URL}?${params.toString()}`;
}

function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/**
 * Derives the meteorological season from the current month and hemisphere.
 * Northern hemisphere: Dec-Feb = Winter, Mar-May = Spring, Jun-Aug = Summer, Sep-Nov = Autumn
 * Southern hemisphere: seasons are reversed.
 */
function deriveSeason(latitude: number): string {
  const month = new Date().getMonth(); // 0-indexed
  const isNorthern = latitude >= 0;

  const northernSeason = (() => {
    if (month <= 1 || month === 11) return "Winter";
    if (month <= 4) return "Spring";
    if (month <= 7) return "Summer";
    return "Autumn";
  })();

  if (isNorthern) return northernSeason;

  // Reverse for southern hemisphere
  const opposite: Record<string, string> = {
    Winter: "Summer",
    Spring: "Autumn",
    Summer: "Winter",
    Autumn: "Spring",
  };
  return opposite[northernSeason] ?? northernSeason;
}
