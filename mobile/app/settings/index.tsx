import { Redirect } from "expo-router";

/**
 * Settings route.
 * Redirects to /profile which houses the unified Profile & Settings view.
 */
export default function SettingsIndex() {
  return <Redirect href="/profile" />;
}
