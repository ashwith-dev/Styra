import * as SecureStore from "expo-secure-store";
import type { OnboardingState } from "@/features/onboarding/types/onboarding";

const ONBOARDING_STORAGE_KEY_PREFIX = "styra_onboarding_v1_";

export async function getOnboardingState(userId: string): Promise<OnboardingState | null> {
  try {
    const key = `${ONBOARDING_STORAGE_KEY_PREFIX}${userId}`;
    const json = await SecureStore.getItemAsync(key);
    if (!json) return null;
    return JSON.parse(json) as OnboardingState;
  } catch {
    return null;
  }
}

export async function saveOnboardingState(
  userId: string,
  state: OnboardingState,
): Promise<void> {
  try {
    const key = `${ONBOARDING_STORAGE_KEY_PREFIX}${userId}`;
    await SecureStore.setItemAsync(key, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save onboarding state:", err);
  }
}

export async function clearOnboardingState(userId: string): Promise<void> {
  try {
    const key = `${ONBOARDING_STORAGE_KEY_PREFIX}${userId}`;
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    console.error("Failed to clear onboarding state:", err);
  }
}
