/**
 * notificationService.ts
 * Wraps expo-notifications with production-grade error handling.
 * All logic lives here — hooks and components never import expo-notifications directly.
 */

import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";

export type NotificationPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined";

/**
 * Returns the current notification permission status without requesting anything.
 */
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return mapStatus(status);
  } catch {
    return "denied";
  }
}

/**
 * Requests notification permission from the OS.
 * Shows the native dialog on the first call; subsequent calls return the stored result.
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  try {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return mapStatus(status);
  } catch {
    return "denied";
  }
}

/**
 * Opens the device notification settings.
 * - iOS: opens app-specific notification settings via app-settings scheme.
 * - Android: opens app notification settings via openSettings.
 */
export async function openNotificationSettings(): Promise<void> {
  try {
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:");
    } else {
      await Linking.openSettings();
    }
  } catch {
    // Silently swallow — settings navigation is best-effort
  }
}

// ─── Private ─────────────────────────────────────────────────────────────────

function mapStatus(
  status: Notifications.PermissionStatus,
): NotificationPermissionStatus {
  switch (status) {
    case Notifications.PermissionStatus.GRANTED:
      return "granted";
    case Notifications.PermissionStatus.DENIED:
      return "denied";
    case Notifications.PermissionStatus.UNDETERMINED:
    default:
      return "undetermined";
  }
}
