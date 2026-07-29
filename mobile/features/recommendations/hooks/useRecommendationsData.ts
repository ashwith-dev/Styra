import { useCallback, useEffect, useRef, useState } from "react";
import { generateId } from "@/lib/uuid";
import * as aiRepo from "@/repositories/aiRepository";
import * as looksRepo from "@/repositories/looksRepository";
import { getUserFacingMessage } from "@/lib/errors";
import type {
  AIRecommendationItemV1,
  AIState,
  RecommendationsViewModel,
} from "../types/ai";

export function useRecommendationsData(): RecommendationsViewModel {
  const [recommendations, setRecommendations] = useState<
    AIRecommendationItemV1[]
  >([]);
  const [aiState, setAiState] = useState<AIState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [occasion, setOccasion] = useState("");
  const [season, setSeason] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const dislikedSetRef = useRef(new Set<string>());

  const fetchRecommendations = useCallback(
    async (params?: { occasion?: string; season?: string }) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setAiState("loading");
      setError(null);

      try {
        const queryParams = {
          occasion: params?.occasion ?? occasion,
          season: params?.season ?? season,
        };

        const { recommendations: items } = await aiRepo.getOutfitRecommendations(
          queryParams,
          controller.signal,
        );

        const filtered = items.filter(
          (item) => !dislikedSetRef.current.has(item.id),
        );
        setRecommendations(filtered);
        setAiState("success");
      } catch (err: unknown) {
        if ((err as Error)?.name === "CanceledError" || (err as Error)?.name === "AbortError") {
          return;
        }
        setError(getUserFacingMessage(err));
        setAiState("error");
      }
    },
    [occasion, season],
  );

  useEffect(() => {
    void fetchRecommendations();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchRecommendations]);

  const submitFeedback = useCallback(
    async (outfitId: string, feedback: "like" | "dislike"): Promise<boolean> => {
      if (feedback === "dislike") {
        dislikedSetRef.current.add(outfitId);
        setRecommendations((prev) => prev.filter((r) => r.id !== outfitId));
      }
      return aiRepo.sendOutfitFeedback(outfitId, feedback);
    },
    [],
  );

  const saveToLooks = useCallback(
    async (outfitId: string): Promise<boolean> => {
      const rec = recommendations.find((r) => r.id === outfitId);
      if (!rec) return false;

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
    },
    [recommendations],
  );

  return {
    recommendations,
    aiState,
    occasion,
    season,
    error,
    actions: {
      fetchRecommendations,
      submitFeedback,
      saveToLooks,
      setOccasion,
      setSeason,
    },
  };
}
