/**
 * useNotificationPermission.ts
 * Manages the notification permission request lifecycle.
 *
 * Flow:
 *  1. requestAndHandlePermission() called (onboarding step 6 / profile toggle)
 *  2. Shows native OS notification dialog
 *  3a. Granted  → onGranted callback + internal state update
 *  3b. Denied   → show in-app PermissionDialog
 *  4. "Open Settings" → openNotificationSettings()
 *  5. "Maybe Later"   → dismiss dialog, call onDenied callback
 *
 *  refreshPermissionStatus() should be called on every app foreground event
 *  so that if the user changes permission in the OS Settings, the app
 *  immediately reflects the real state.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
  getNotificationPermissionStatus,
  openNotificationSettings,
  requestNotificationPermission,
  type NotificationPermissionStatus,
} from "@/lib/services/notificationService";

export interface NotificationPermissionState {
  permissionStatus: NotificationPermissionStatus;
  showDeniedDialog: boolean;
  isRequesting: boolean;
  /** Call this when the user taps "Turn On Notifications" */
  requestAndHandlePermission: (
    onGranted?: () => void,
    onDenied?: () => void,
  ) => Promise<void>;
  /** "Open Settings" button in the denied dialog */
  handleDialogPrimary: () => void;
  /** "Maybe Later" button in the denied dialog — calls onDenied internally */
  handleDialogSecondary: () => void;
  /** Re-check the real OS permission — call on app foreground */
  refreshPermissionStatus: () => Promise<void>;
}

export function useNotificationPermission(): NotificationPermissionState {
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>("undetermined");
  const [showDeniedDialog, setShowDeniedDialog] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Store callbacks across re-renders without causing extra effects
  const onDeniedRef = useRef<(() => void) | undefined>(undefined);

  // ── Sync with real OS state on mount ───────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    void (async () => {
      const status = await getNotificationPermissionStatus();
      if (mounted) setPermissionStatus(status);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Re-sync when the app returns to foreground ─────────────────────────────
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        void (async () => {
          const status = await getNotificationPermissionStatus();
          setPermissionStatus(status);
        })();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);

  // ── Refresh helper ─────────────────────────────────────────────────────────
  const refreshPermissionStatus = useCallback(async () => {
    const status = await getNotificationPermissionStatus();
    setPermissionStatus(status);
  }, []);

  // ── Main action ────────────────────────────────────────────────────────────
  const requestAndHandlePermission = useCallback(
    async (onGranted?: () => void, onDenied?: () => void) => {
      if (isRequesting) return;

      onDeniedRef.current = onDenied;

      try {
        setIsRequesting(true);

        const current = await getNotificationPermissionStatus();

        if (current === "denied") {
          // Already denied — show in-app dialog, skip re-requesting
          setPermissionStatus("denied");
          setShowDeniedDialog(true);
          return;
        }

        if (current === "granted") {
          setPermissionStatus("granted");
          onGranted?.();
          return;
        }

        // Show native OS dialog
        const result = await requestNotificationPermission();
        setPermissionStatus(result);

        if (result === "granted") {
          onGranted?.();
        } else {
          setShowDeniedDialog(true);
        }
      } catch {
        // Safety net — never crash
      } finally {
        setIsRequesting(false);
      }
    },
    [isRequesting],
  );

  // ── Dialog button handlers ─────────────────────────────────────────────────
  const handleDialogPrimary = useCallback(() => {
    setShowDeniedDialog(false);
    void openNotificationSettings();
  }, []);

  const handleDialogSecondary = useCallback(() => {
    setShowDeniedDialog(false);
    onDeniedRef.current?.();
  }, []);

  return {
    permissionStatus,
    showDeniedDialog,
    isRequesting,
    requestAndHandlePermission,
    handleDialogPrimary,
    handleDialogSecondary,
    refreshPermissionStatus,
  };
}
