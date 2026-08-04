import * as FileSystem from "expo-file-system";
import { clearAiCache } from "./aiCache";
import { clearOnboardingState } from "./onboarding";
import { clearPreferences } from "./preferences";
import { clearSavedLooks } from "./savedLooks";
import { clearWardrobeCache } from "./wardrobeCache";
import { clearQueue } from "../sync/mutationQueue";
import { resetWardrobeMemoryCache } from "@/hooks/useWardrobe";
import { clearLastRecommendations } from "@/features/recommendations/cache";

const AI_RECS_FILE = `${FileSystem.cacheDirectory}styra_ai_recommendations_cache_v1.json`;
const AI_INSIGHTS_FILE = `${FileSystem.cacheDirectory}styra_ai_insights_cache_v1.json`;
const WARDROBE_CACHE_FILE = `${FileSystem.cacheDirectory}styra_wardrobe_cache_v1.json`;

/**
 * Wipe every piece of user data cached on-device. Called on sign-out and
 * account deletion so the next account on this device never sees the
 * previous user's wardrobe, looks, or preferences.
 */
export async function clearAllLocalData(userId?: string): Promise<void> {
  resetWardrobeMemoryCache();
  clearLastRecommendations();
  await Promise.all([
    clearWardrobeCache().catch(() => {}),
    clearAiCache().catch(() => {}),
    clearPreferences().catch(() => {}),
    clearSavedLooks().catch(() => {}),
    clearQueue().catch(() => {}),
    userId ? clearOnboardingState(userId).catch(() => {}) : Promise.resolve(),
  ]);
}

async function fileSize(path: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(path, { size: true });
    return info.exists ? (info.size ?? 0) : 0;
  } catch {
    return 0;
  }
}

/** Total size of the regenerable on-device caches, in bytes. */
export async function getCacheSizeBytes(): Promise<number> {
  const sizes = await Promise.all(
    [WARDROBE_CACHE_FILE, AI_RECS_FILE, AI_INSIGHTS_FILE].map(fileSize),
  );
  return sizes.reduce((a, b) => a + b, 0);
}

/** Delete only regenerable caches (not user data like looks or preferences). */
export async function clearDataCaches(): Promise<void> {
  resetWardrobeMemoryCache();
  await Promise.all([clearWardrobeCache().catch(() => {}), clearAiCache().catch(() => {})]);
}
