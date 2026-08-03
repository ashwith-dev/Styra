import { generateId } from "@/lib/uuid";
import * as looksRepo from "@/repositories/looksRepository";
import type { AIRecommendationItemV1 } from "./types/ai";

// Module-level cache of the last fetched (and user-filtered) recommendation
// list. The detail screen reads from this by index instead of refetching —
// a second fetch could return a different ordering, showing the wrong outfit.
let _lastRecommendations: AIRecommendationItemV1[] = [];

export function setLastRecommendations(recs: AIRecommendationItemV1[]): void {
  _lastRecommendations = recs;
}

export function getLastRecommendations(): AIRecommendationItemV1[] {
  return _lastRecommendations;
}

export function clearLastRecommendations(): void {
  _lastRecommendations = [];
}

/** Persist an AI recommendation as a saved look. Returns success. */
export async function saveRecommendationAsLook(
  rec: AIRecommendationItemV1,
): Promise<boolean> {
  const lookItems = rec.items.map((item) => ({
    id: generateId(),
    clothing_item_id: item.id,
    thumbnail_url: item.thumbnail_url || null,
    segmented_image_url: item.segmented_image_url || null,
    attributes: item.attributes || {},
  }));

  try {
    await looksRepo.createLook({
      name: rec.title,
      description: rec.explanation,
      category: rec.category,
      season: rec.season || "All Seasons",
      source: "ai",
      items: lookItems,
    });
    return true;
  } catch {
    return false;
  }
}
