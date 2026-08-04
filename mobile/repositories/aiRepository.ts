import * as analysisService from "@/services/ai/clothingAnalysisService";
import * as recommendationService from "@/services/ai/recommendationService";
import * as insightsService from "@/services/ai/wardrobeInsightsService";
import { isOnline } from "@/lib/network/networkStatus";
import * as aiCache from "@/lib/storage/aiCache";
import type { ClothingItemBrief, OutfitRecommendationItem } from "@/lib/types";
import type {
  AIRecommendationItemV1,
  AIWardrobeInsightV1,
} from "@/features/recommendations/types/ai";

/**
 * Model Mapping Helper:
 * Repository translates raw backend DTO (OutfitRecommendationItem) into stable,
 * versioned UI-friendly model (AIRecommendationItemV1). ViewModels never see backend field names.
 */
function mapBackendOutfitToV1(
  dto: OutfitRecommendationItem,
): AIRecommendationItemV1 {
  const items: ClothingItemBrief[] = dto.outfit_items.map((item) => ({
    id: item.id,
    original_image_url: "",
    segmented_image_url: item.thumbnail_url || "",
    thumbnail_url: item.thumbnail_url,
    attributes: item.attributes || {},
    status: "active",
    created_at: "",
  }));

  return {
    id: dto.outfit_id,
    title: `${dto.outfit_category.toUpperCase()} OUTFIT`,
    category: dto.outfit_category,
    items,
    matchScore: Math.round(dto.score),
    explanation: dto.explanation || "Curated based on color harmony and style context.",
  };
}

export async function getOutfitRecommendations(
  params?: { occasion?: string; season?: string },
  signal?: AbortSignal,
): Promise<{ recommendations: AIRecommendationItemV1[]; fromCache: boolean }> {
  const cachedMeta = await aiCache.getRecommendationsCache();
  const cachedData = cachedMeta?.data ?? [];

  if (!isOnline()) {
    return { recommendations: cachedData, fromCache: true };
  }

  try {
    const rawResponse = await recommendationService.fetchOutfitRecommendations(
      params,
      signal,
    );
    const mapped = rawResponse.recommendations.map(mapBackendOutfitToV1);
    await aiCache.setRecommendationsCache(mapped);
    return { recommendations: mapped, fromCache: false };
  } catch (err) {
    if (cachedData.length > 0) {
      return { recommendations: cachedData, fromCache: true };
    }
    throw err;
  }
}

export async function sendOutfitFeedback(
  outfitId: string,
  feedback: "like" | "dislike",
): Promise<boolean> {
  try {
    await recommendationService.sendOutfitFeedback(outfitId, feedback);
    return true;
  } catch {
    return false;
  }
}

export async function analyzeClothingImage(
  photoUri: string,
  signal?: AbortSignal,
) {
  return analysisService.analyzePhoto(photoUri, signal);
}

export async function computeWardrobeInsights(
  items: ClothingItemBrief[],
): Promise<AIWardrobeInsightV1> {
  const insights = insightsService.generateWardrobeInsights(items);
  await aiCache.setInsightsCache(insights);
  return insights;
}
