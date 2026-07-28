import { Redirect } from "expo-router";
import { useAuth } from "../providers/AuthProvider";

/**
 * Root index route.
 * Authenticated users go to /wardrobe.
 * Unauthenticated users enter the auth flow via the splash screen.
 */
export default function Index() {
  const { session } = useAuth();
  return <Redirect href={session ? "/home" : "/auth/splash"} />;
}
