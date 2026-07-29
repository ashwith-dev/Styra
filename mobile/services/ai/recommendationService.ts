import * as api from "@/lib/api";
import type { OutfitRecommendationResponse, OutfitRecommendationItem } from "@/lib/types";

export async function fetchOutfitRecommendations(
  params?: { occasion?: string; season?: string },
  signal?: AbortSignal,
): Promise<OutfitRecommendationResponse> {
  return api.getOutfitRecommendations(params);
}

export async function sendOutfitFeedback(
  outfitId: string,
  feedback: "like" | "dislike",
): Promise<void> {
  return api.submitOutfitFeedback({ outfit_id: outfitId, feedback });
}

export async function favoriteOutfit(
  outfitId: string,
  outfitData: OutfitRecommendationItem,
): Promise<void> {
  await api.addOutfitFavorite({ outfit_id: outfitId, outfit_data: outfitData });
}
