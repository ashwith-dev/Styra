import * as SecureStore from "expo-secure-store";
import type {
  AIRecommendationItemV1,
  AIWardrobeInsightV1,
} from "@/features/recommendations/types/ai";

export interface CacheMetadata<T> {
  data: T;
  lastUpdated: string;
  version: number;
}

const RECS_CACHE_KEY = "styra_ai_recommendations_cache_v1";
const INSIGHTS_CACHE_KEY = "styra_ai_insights_cache_v1";
const ANALYSIS_CACHE_KEY = "styra_ai_analysis_cache_v1";

const CACHE_VERSION = 1;

// ── Recommendations Cache Namespace ──

export async function getRecommendationsCache(): Promise<CacheMetadata<
  AIRecommendationItemV1[]
> | null> {
  try {
    const json = await SecureStore.getItemAsync(RECS_CACHE_KEY);
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
    await SecureStore.setItemAsync(RECS_CACHE_KEY, JSON.stringify(metadata));
  } catch (err) {
    console.error("Failed to write recommendations cache:", err);
  }
}

// ── Insights Cache Namespace ──

export async function getInsightsCache(): Promise<CacheMetadata<AIWardrobeInsightV1> | null> {
  try {
    const json = await SecureStore.getItemAsync(INSIGHTS_CACHE_KEY);
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
    await SecureStore.setItemAsync(INSIGHTS_CACHE_KEY, JSON.stringify(metadata));
  } catch (err) {
    console.error("Failed to write insights cache:", err);
  }
}

// ── Analysis Cache Namespace ──

export async function getAnalysisCache(
  photoUri: string,
): Promise<CacheMetadata<Record<string, unknown>> | null> {
  try {
    const key = `${ANALYSIS_CACHE_KEY}_${encodeURIComponent(photoUri)}`;
    const json = await SecureStore.getItemAsync(key);
    if (!json) return null;
    return JSON.parse(json) as CacheMetadata<Record<string, unknown>>;
  } catch {
    return null;
  }
}

export async function setAnalysisCache(
  photoUri: string,
  data: Record<string, unknown>,
): Promise<void> {
  const key = `${ANALYSIS_CACHE_KEY}_${encodeURIComponent(photoUri)}`;
  const metadata: CacheMetadata<Record<string, unknown>> = {
    data,
    lastUpdated: new Date().toISOString(),
    version: CACHE_VERSION,
  };
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(metadata));
  } catch (err) {
    console.error("Failed to write analysis cache:", err);
  }
}
