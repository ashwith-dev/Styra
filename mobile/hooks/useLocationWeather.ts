/**
 * useLocationWeather.ts
 *
 * Manages location permission check & Open-Meteo weather fetch.
 *
 * Session caching:
 *  All state lives in a module-level store, NOT in component state. When
 *  HomeScreen remounts on tab switches (Home ↔ Wardrobe ↔ Profile), the hook
 *  simply re-reads the cached store — weather is fetched ONCE per app session
 *  and re-displayed instantly, with no spinner and no re-fetch. Only a cold
 *  app launch runs the initial check again.
 *
 * Rules:
 *  1. First mount of the session (silent — NEVER auto-show a popup):
 *     - Granted & GPS on: fetch weather immediately, hide banner.
 *     - Anything else (denied / undetermined / GPS off): header stays at
 *       "_ • COLLEGE" and the light-red banner is shown quietly.
 *  2. On user tap (header "_ • COLLEGE" / weather card / banner text):
 *     - Permission not granted: request the native OS permission dialog first
 *       (Android shows it when it still can; resolves silently otherwise).
 *     - Once granted, getCurrentPositionAsync is called DIRECTLY — if device
 *       location is off, Google Play Services renders its native "Location
 *       Accuracy" in-app bottom sheet ("Turn on" / "No, thanks").
 *       - "Turn on": GPS enables → coordinates → weather fetched → header &
 *         weather card update, banner hides.
 *       - "No, thanks": status "denied", light-red banner shown.
 *         NO Settings-app redirect, ever.
 *  3. On AppState active: silent recheck ONLY until weather has been fetched
 *     once (recovers after the user enables permission/GPS in Settings).
 *  4. Banner [x]: dismissed for the rest of the session. Passive rechecks
 *     respect the dismissal; an explicit user tap may re-show it as feedback.
 */

import { useCallback, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
  getCurrentLocation,
  getLocationPermissionStatus,
  isLocationServicesEnabled,
  requestLocationPermission,
} from "@/lib/services/locationService";
import { fetchWeatherByCoords } from "@/lib/services/weatherService";
import type { WeatherData } from "@/lib/services/weatherService";

export type LocationStatus =
  | "idle"
  | "requesting_permission"
  | "fetching_location"
  | "fetching_weather"
  | "success"
  | "denied"
  | "error";

export interface LocationWeatherState {
  weatherData: WeatherData | null;
  locationStatus: LocationStatus;
  showLocationBanner: boolean;
  dismissBanner: () => void;
  triggerLocationWeather: () => Promise<void>;
}

type FetchOutcome = "success" | "unavailable" | "busy";
type TemperatureUnit = "celsius" | "fahrenheit";

interface SessionState {
  weatherData: WeatherData | null;
  locationStatus: LocationStatus;
  showLocationBanner: boolean;
}

// ─── Session store ────────────────────────────────────────────────────────────
// Module level on purpose: survives HomeScreen remounts, reset only when the
// app process is killed (cold launch).

let sessionState: SessionState = {
  weatherData: null,
  locationStatus: "idle",
  showLocationBanner: false,
};

let sessionChecked = false; // initial silent check already ran this session
let bannerDismissed = false; // user tapped [x] this session
let isFetching = false;

const listeners = new Set<() => void>();

function setSessionState(partial: Partial<SessionState>): void {
  sessionState = { ...sessionState, ...partial };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ── Core fetch (call only when permission is granted) ─────────────────────────
// No GPS pre-check: calling getCurrentPositionAsync directly is what lets
// Google Play Services show the "Location Accuracy" bottom sheet on Android.

async function runFetch(unit: TemperatureUnit): Promise<FetchOutcome> {
  if (isFetching) return "busy";
  isFetching = true;

  try {
    setSessionState({ locationStatus: "fetching_location" });
    const coords = await getCurrentLocation();
    if (!coords) return "unavailable";

    setSessionState({ locationStatus: "fetching_weather" });
    const weather = await fetchWeatherByCoords(
      coords.latitude,
      coords.longitude,
      unit,
    );
    if (!weather) return "unavailable";

    setSessionState({
      weatherData: weather,
      locationStatus: "success",
      showLocationBanner: false,
    });
    return "success";
  } catch {
    return "unavailable";
  } finally {
    isFetching = false;
  }
}

// ── Silent recheck — never pops anything ──────────────────────────────────────

async function silentRecheck(unit: TemperatureUnit): Promise<void> {
  const status = await getLocationPermissionStatus();
  const gpsEnabled = await isLocationServicesEnabled();

  if (status === "granted" && gpsEnabled) {
    const outcome = await runFetch(unit);
    if (outcome === "unavailable") {
      setSessionState({ locationStatus: "error" }); // transient — stay quiet
    }
    return;
  }

  if (status === "denied" || status === "restricted") {
    setSessionState({ locationStatus: "denied" });
  }

  // Not granted or GPS off → "_ • COLLEGE" + quiet banner (respects [x] dismiss)
  if (!bannerDismissed) {
    setSessionState({ showLocationBanner: true });
  }
}

// ── Tap trigger (header tag, weather card, or banner text) ────────────────────

async function triggerFlow(unit: TemperatureUnit): Promise<void> {
  if (isFetching) return;
  const current = sessionState.locationStatus;
  if (
    current === "requesting_permission" ||
    current === "fetching_location" ||
    current === "fetching_weather"
  ) {
    return;
  }

  try {
    let status = await getLocationPermissionStatus();

    // 1. Permission not granted — ask via the native OS dialog. On Android
    // the dialog still appears until the user denies twice; otherwise this
    // resolves instantly with the current status (no Settings redirect).
    if (status !== "granted") {
      setSessionState({ locationStatus: "requesting_permission" });
      status = await requestLocationPermission();
      if (status !== "granted") {
        setSessionState({ locationStatus: "denied", showLocationBanner: true });
        return;
      }
    }

    // 2. Permission granted — call GPS directly. If device location is off,
    // Android shows the Google "Location Accuracy" bottom sheet here.
    const outcome = await runFetch(unit);
    if (outcome === "unavailable") {
      // "No, thanks" on the Google dialog (or GPS unavailable) — banner only
      setSessionState({ locationStatus: "denied", showLocationBanner: true });
    }
  } catch {
    setSessionState({ locationStatus: "error" });
  }
}

// ─── Hook — thin subscriber over the session store ────────────────────────────

export function useLocationWeather(
  temperatureUnit: TemperatureUnit = "celsius",
): LocationWeatherState {
  const [snapshot, setSnapshot] = useState<SessionState>(sessionState);

  useEffect(() => {
    const unsubscribe = subscribe(() => setSnapshot(sessionState));
    setSnapshot(sessionState); // sync anything missed before subscribing
    return unsubscribe;
  }, []);

  // Initial silent check — once per app session, never on tab remounts
  useEffect(() => {
    if (!sessionChecked) {
      sessionChecked = true;
      void silentRecheck(temperatureUnit);
    }
  }, [temperatureUnit]);

  // Foreground recheck — only until weather has been fetched once this session
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState !== "active") return;
      if (sessionState.locationStatus === "success") return;
      void silentRecheck(temperatureUnit);
    };

    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [temperatureUnit]);

  const dismissBanner = useCallback(() => {
    bannerDismissed = true;
    setSessionState({ showLocationBanner: false });
  }, []);

  const triggerLocationWeather = useCallback(async () => {
    await triggerFlow(temperatureUnit);
  }, [temperatureUnit]);

  return {
    weatherData: snapshot.weatherData,
    locationStatus: snapshot.locationStatus,
    showLocationBanner: snapshot.showLocationBanner,
    dismissBanner,
    triggerLocationWeather,
  };
}
