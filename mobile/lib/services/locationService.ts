/**
 * locationService.ts
 * Wraps expo-location with production-grade error handling.
 * All logic lives here — hooks and components never import expo-location directly.
 */

import * as Location from "expo-location";
import { LOCATION_TIMEOUT_MS } from "./permissionConstants";

export type LocationPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined"
  | "restricted";

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

/**
 * Checks if hardware location services (GPS) are turned on in phone settings.
 */
export async function isLocationServicesEnabled(): Promise<boolean> {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch {
    return false;
  }
}

/**
 * Returns the current location permission status without requesting anything.
 */
export async function getLocationPermissionStatus(): Promise<LocationPermissionStatus> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return mapStatus(status);
  } catch {
    return "denied";
  }
}

/**
 * Requests foreground location permission.
 * Returns the resulting status after the native dialog closes.
 */
export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return mapStatus(status);
  } catch {
    return "denied";
  }
}

/**
 * Gets the device's current GPS coordinates.
 *
 * getCurrentPositionAsync is called DIRECTLY (no hasServicesEnabledAsync gate)
 * so that when device location is off, Android Google Play Services renders its
 * native "Location Accuracy" in-app bottom sheet ("Turn on" / "No, thanks")
 * instead of the app redirecting to the Settings app.
 *
 * Resolves with null on timeout, GPS unavailability, or if the user dismisses
 * the bottom sheet with "No, thanks" (the promise rejects — caught here).
 */
export async function getCurrentLocation(): Promise<LocationCoords | null> {
  try {
    const locationPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // sufficient for weather lookup
    });

    // Race the GPS call against a timeout so we never block forever
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), LOCATION_TIMEOUT_MS),
    );

    const result = await Promise.race([locationPromise, timeoutPromise]);
    if (!result) return null;

    return {
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
    };
  } catch {
    // User tapped "No, thanks" on the Google dialog, or GPS unavailable
    return null;
  }
}

// ─── Private ─────────────────────────────────────────────────────────────────

function mapStatus(
  status: Location.PermissionStatus,
): LocationPermissionStatus {
  switch (status) {
    case Location.PermissionStatus.GRANTED:
      return "granted";
    case Location.PermissionStatus.DENIED:
      return "denied";
    case Location.PermissionStatus.UNDETERMINED:
      return "undetermined";
    default:
      return "denied";
  }
}
