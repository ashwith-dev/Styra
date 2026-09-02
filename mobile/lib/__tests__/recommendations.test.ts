import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/ai/clothingAnalysisService", () => ({}));
vi.mock("@/services/ai/wardrobeInsightsService", () => ({}));
vi.mock("@/services/ai/recommendationService", () => ({
  fetchOutfitRecommendations: vi.fn(),
  sendOutfitFeedback: vi.fn(),
}));
vi.mock("@/lib/storage/aiCache", () => ({
  getRecommendationsCache: vi.fn(async () => null),
  setRecommendationsCache: vi.fn(async () => undefined),
  getInsightsCache: vi.fn(async () => null),
  setInsightsCache: vi.fn(async () => undefined),
}));
vi.mock("@/lib/network/networkStatus", () => ({ isOnline: () => true }));
vi.mock("@/repositories/looksRepository", () => ({
  createLook: vi.fn(async (data: unknown) => ({
    ...(data as object),
    id: "look-1",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  })),
}));

import * as recommendationService from "@/services/ai/recommendationService";
import * as looksRepo from "@/repositories/looksRepository";
import { getOutfitRecommendations } from "@/repositories/aiRepository";
import {
  clearLastRecommendations,
  getLastRecommendations,
  saveRecommendationAsLook,
  setLastRecommendations,
} from "@/features/recommendations/cache";
import type { OutfitRecommendationItem } from "@/lib/types";
import type { AIRecommendationItemV1 } from "@/features/recommendations";

function backendRec(overrides: Partial<OutfitRecommendationItem> = {}): OutfitRecommendationItem {
  return {
    outfit_id: "item-b-item-a",
    outfit_items: [
      { id: "item-a", attributes: {}, thumbnail_url: "https://x/a.png" },
      { id: "item-b", attributes: {}, thumbnail_url: null },
    ],
    score: 85.5,
    explanation: "Neutral colours work well together.",
    outfit_category: "casual",
    ...overrides,
  };
}

describe("aiRepository.getOutfitRecommendations", () => {
  beforeEach(() => {
    vi.mocked(recommendationService.fetchOutfitRecommendations).mockResolvedValue({
      recommendations: [backendRec()],
    });
  });

  it("maps the backend 0–100 score directly (no double scaling)", async () => {
    const { recommendations } = await getOutfitRecommendations();

    // Regression: the mapper used to multiply by 100, rendering "8550% MATCH".
    expect(recommendations[0].matchScore).toBe(86);
  });

  it("maps outfit fields into the V1 UI model", async () => {
    const { recommendations } = await getOutfitRecommendations();

    const rec = recommendations[0];
    expect(rec.id).toBe("item-b-item-a");
    expect(rec.title).toBe("CASUAL OUTFIT");
    expect(rec.category).toBe("casual");
    expect(rec.items).toHaveLength(2);
    expect(rec.items[0].thumbnail_url).toBe("https://x/a.png");
    expect(rec.explanation).toBe("Neutral colours work well together.");
  });
});

describe("recommendations module cache", () => {
  beforeEach(() => clearLastRecommendations());

  it("stores and returns the last recommendation list", () => {
    const recs = [{ id: "r1" } as AIRecommendationItemV1];
    setLastRecommendations(recs);
    expect(getLastRecommendations()).toBe(recs);
  });

  it("clears the list (sign-out safety)", () => {
    setLastRecommendations([{ id: "r1" } as AIRecommendationItemV1]);
    clearLastRecommendations();
    expect(getLastRecommendations()).toEqual([]);
  });
});

describe("saveRecommendationAsLook", () => {
  it("persists the recommendation as a local look with mapped items", async () => {
    const rec: AIRecommendationItemV1 = {
      id: "o1",
      title: "CASUAL OUTFIT",
      category: "casual",
      items: [
        {
          id: "item-a",
          original_image_url: "",
          segmented_image_url: "https://x/a.png",
          thumbnail_url: "https://x/a.png",
          attributes: {},
          status: "active",
          created_at: "",
        },
      ],
      matchScore: 86,
      explanation: "Great combo",
    };

    const success = await saveRecommendationAsLook(rec);

    expect(success).toBe(true);
    expect(looksRepo.createLook).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "CASUAL OUTFIT",
        source: "ai",
        items: [
          expect.objectContaining({
            clothing_item_id: "item-a",
            thumbnail_url: "https://x/a.png",
          }),
        ],
      }),
    );
  });

  it("returns false instead of throwing when persistence fails", async () => {
    vi.mocked(looksRepo.createLook).mockRejectedValueOnce(new Error("disk full"));

    const success = await saveRecommendationAsLook({
      id: "o1",
      title: "T",
      category: "casual",
      items: [],
      matchScore: 1,
      explanation: "",
    });

    expect(success).toBe(false);
  });
});
