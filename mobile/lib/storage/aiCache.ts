import * as FileSystem from "expo-file-system";
import type {
  AIRecommendationItemV1,
  AIWardrobeInsightV1,
} from "@/features/recommendations/types/ai";

export interface CacheMetadata<T> {
  data: T;
  lastUpdated: string;
  version: number;
}

const RECS_FILE = `${FileSystem.cacheDirectory}styra_ai_recommendations_cache_v1.json`;
const INSIGHTS_FILE = `${FileSystem.cacheDirectory}styra_ai_insights_cache_v1.json`;

const CACHE_VERSION = 1;

// ── Recommendations Cache ──

export async function getRecommendationsCache(): Promise<CacheMetadata<
  AIRecommendationItemV1[]
> | null> {
  try {
    const info = await FileSystem.getInfoAsync(RECS_FILE);
    if (!info.exists) return null;
    const json = await FileSystem.readAsStringAsync(RECS_FILE);
    if (!json) return null;
    return JSON.parse(json) as CacheMetadata<AIRecommendationItemV1[]>;
  } catch {
    return null;
  }
}

export async function setRecommendationsCache(
  data: AIRecommendationItemV1[],
): Promise<void> {
  const metadata: CacheMetadata<AIRecommendationItemV1[]> = {
    data,
    lastUpdated: new Date().toISOString(),
    version: CACHE_VERSION,
  };
  try {
    await FileSystem.writeAsStringAsync(RECS_FILE, JSON.stringify(metadata));
  } catch (err) {
    console.error("Failed to write recommendations cache:", err);
  }
}

// ── Insights Cache ──

export async function getInsightsCache(): Promise<CacheMetadata<AIWardrobeInsightV1> | null> {
  try {
    const info = await FileSystem.getInfoAsync(INSIGHTS_FILE);
    if (!info.exists) return null;
    const json = await FileSystem.readAsStringAsync(INSIGHTS_FILE);
    if (!json) return null;
    return JSON.parse(json) as CacheMetadata<AIWardrobeInsightV1>;
  } catch {
    return null;
  }
}

export async function setInsightsCache(
  data: AIWardrobeInsightV1,
): Promise<void> {
  const metadata: CacheMetadata<AIWardrobeInsightV1> = {
    data,
    lastUpdated: new Date().toISOString(),
    version: CACHE_VERSION,
  };
  try {
    await FileSystem.writeAsStringAsync(INSIGHTS_FILE, JSON.stringify(metadata));
  } catch (err) {
    console.error("Failed to write insights cache:", err);
  }
}

export async function clearAiCache(): Promise<void> {
  for (const file of [RECS_FILE, INSIGHTS_FILE]) {
    try {
      await FileSystem.deleteAsync(file, { idempotent: true });
    } catch (err) {
      console.error("Failed to clear AI cache:", err);
    }
  }
}
