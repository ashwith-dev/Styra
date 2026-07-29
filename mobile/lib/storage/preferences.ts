import * as SecureStore from "expo-secure-store";
import { DEFAULT_PREFERENCES } from "@/features/profile/config";
import type { UserPreferences } from "@/features/profile/types/profile";

export interface CacheMetadata<T> {
  data: T;
  lastUpdated: string;
  version: number;
}

const PREFERENCES_STORAGE_KEY = "styra_user_preferences_v1";
const PREFERENCES_CACHE_VERSION = 1;

export async function getPreferencesMetadata(): Promise<CacheMetadata<UserPreferences> | null> {
  try {
    const json = await SecureStore.getItemAsync(PREFERENCES_STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json) as CacheMetadata<UserPreferences>;
  } catch (err) {
    console.warn("Failed to read user preferences from storage:", err);
    return null;
  }
}

export async function getPreferences(): Promise<UserPreferences> {
  const meta = await getPreferencesMetadata();
  if (!meta) return DEFAULT_PREFERENCES;
  return { ...DEFAULT_PREFERENCES, ...meta.data };
}

export async function updatePreferences(
  updates: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const current = await getPreferences();
  const updated: UserPreferences = {
    ...current,
    ...updates,
    notifications: {
      ...current.notifications,
      ...(updates.notifications || {}),
    },
  };

  const metadata: CacheMetadata<UserPreferences> = {
    data: updated,
    lastUpdated: new Date().toISOString(),
    version: PREFERENCES_CACHE_VERSION,
  };

  try {
    await SecureStore.setItemAsync(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(metadata),
    );
  } catch (err) {
    console.error("Failed to update user preferences in storage:", err);
    throw new Error("Could not save preferences.");
  }

  return updated;
}

export async function resetPreferences(): Promise<UserPreferences> {
  await updatePreferences(DEFAULT_PREFERENCES);
  return DEFAULT_PREFERENCES;
}

export async function clearPreferences(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(PREFERENCES_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear preferences:", err);
  }
}
