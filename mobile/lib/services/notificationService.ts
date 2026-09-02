/**
 * notificationService.ts
 * Wraps expo-notifications with production-grade error handling.
 * All logic lives here — hooks and components never import expo-notifications directly.
 */

import * as Notifications from "expo-notifications";
import { Alert, Linking, Platform } from "react-native";

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
    console.log("[NotificationService] getPermissions status:", status);
    return mapStatus(status);
  } catch (error) {
    console.warn("[NotificationService] getPermissionsAsync failed:", error);
    // Return undetermined instead of denied so we still attempt to request
    return "undetermined";
  }
}

/**
 * Requests notification permission from the OS.
 * Shows the native dialog on the first call; subsequent calls return the stored result.
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  try {
    console.log("[NotificationService] Requesting notification permission...");
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    console.log("[NotificationService] requestPermissions result:", status);
    return mapStatus(status);
  } catch (error) {
    console.warn("[NotificationService] requestPermissionsAsync failed:", error);

    // On simulators / Expo Go, push-notification APIs can fail.
    // Show a user-visible alert so the failure isn't invisible.
    if (__DEV__) {
      Alert.alert(
        "Notification Permission Error",
        "Could not request notification permission. " +
          "Push notifications are not supported on the iOS Simulator. " +
          "Please test on a physical device or a development build.\n\n" +
          `Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

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
  } catch (error) {
    console.warn("[NotificationService] openSettings failed:", error);
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
