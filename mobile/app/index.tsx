import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../providers/AuthProvider";
import { getOnboardingState } from "../lib/storage/onboarding";

/**
 * Root index route.
 * Unauthenticated users enter auth flow via /auth/splash.
 * Authenticated users go to /onboarding if not completed, or /home if completed.
 */
export default function Index() {
  const { session, user } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!session || !user) {
      setCheckingOnboarding(false);
      return;
    }

    void (async () => {
      const state = await getOnboardingState(user.id);
      if (mounted) {
        setOnboardingCompleted(Boolean(state?.completed));
        setCheckingOnboarding(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [session, user]);

  if (!session) {
    return <Redirect href="/auth/splash" />;
  }

  if (checkingOnboarding) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1A1A1A" />
      </View>
    );
  }

  return <Redirect href={onboardingCompleted ? "/home" : "/onboarding"} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#FAF8F5",
    alignItems: "center",
    justifyContent: "center",
  },
});
