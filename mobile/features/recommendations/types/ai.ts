import type { ClothingItemBrief } from "@/lib/types";

export type AIState =
  | "idle"
  | "loading"
  | "generating"
  | "refreshing"
  | "success"
  | "error";

export interface RecommendationContext {
  wardrobeVersion: number;
  occasion?: string;
  season?: string;
  weather?: string;
  generatedAt: string;
  modelVersion: string;
}

export interface AIRecommendationItemV1 {
  id: string;
  title: string;
  category: string;
  items: ClothingItemBrief[];
  matchScore: number;
  explanation: string;
  occasion?: string;
  season?: string;
}

export interface AIRecommendationV1 {
  id: string;
  items: AIRecommendationItemV1[];
  context: RecommendationContext;
}

export interface AIWardrobeInsightV1 {
  totalItems: number;
  categoryDistribution: Record<string, number>;
  topStyle: string;
  suggestedAdditions: string[];
  generatedAt: string;
}

export interface RecommendationsActions {
  fetchRecommendations: (params?: {
    occasion?: string;
    season?: string;
  }) => Promise<void>;
  submitFeedback: (
    outfitId: string,
    feedback: "like" | "dislike",
  ) => Promise<boolean>;
  saveToLooks: (outfitId: string) => Promise<boolean>;
  setOccasion: (occasion: string) => void;
  setSeason: (season: string) => void;
}

export interface RecommendationsViewModel {
  recommendations: AIRecommendationItemV1[];
  aiState: AIState;
  occasion: string;
  season: string;
  error: string | null;
  actions: RecommendationsActions;
}
