/** Mirrors the backend's AttributeConfidence schema. */
export interface AttributeConfidence {
  value: unknown;
  confidence: number;
}

/** Mirrors the backend's AIPipelineResult schema. */
export interface AIPipelineResult {
  category: AttributeConfidence;
  type: AttributeConfidence;
  color: AttributeConfidence;
  color_hex?: AttributeConfidence | null;
  pattern?: AttributeConfidence | null;
  material?: AttributeConfidence | null;
  style?: AttributeConfidence | null;
  neckline?: AttributeConfidence | null;
  sleeve_length?: AttributeConfidence | null;
  fit?: AttributeConfidence | null;
  length?: AttributeConfidence | null;
  closure?: AttributeConfidence | null;
  season: AttributeConfidence[];
  occasion: AttributeConfidence[];
  brand?: string | null;
  description: string;
  model_name: string;
  model_version: string;
}

/** Response from POST /analyze-clothing */
export interface AnalyzeClothingResponse {
  pipeline_token: string;
  result: AIPipelineResult;
  segmented_image_url: string;
  thumbnail_url?: string | null;
  metrics: StageMetric[];
}

export interface StageMetric {
  stage: string;
  status: string;
  duration_ms: number;
  error?: string | null;
}

/** Response from POST /clothing */
export interface SavedClothingItem {
  id: string;
  original_image_url: string;
  segmented_image_url: string;
  thumbnail_url?: string | null;
  attributes: Record<string, unknown>;
}

/** Brief item from GET /clothing */
export interface ClothingItemBrief {
  id: string;
  original_image_url: string;
  segmented_image_url: string;
  thumbnail_url?: string | null;
  attributes: Record<string, unknown>;
  status: string;
  created_at: string;
}

/** Detail item from GET /clothing/:id */
export interface ClothingItemDetail {
  id: string;
  original_image_url: string;
  segmented_image_url: string;
  thumbnail_url?: string | null;
  attributes: Record<string, unknown>;
  raw_pipeline_result?: Record<string, unknown> | null;
  pipeline_metrics?: Record<string, unknown> | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// ── Outfit recommendations (Phase 4A) ──

/** An item within a recommended outfit. */
export interface OutfitItem {
  id: string;
  attributes: Record<string, unknown>;
  thumbnail_url: string | null;
}

/** One scored outfit recommendation. */
export interface OutfitRecommendationItem {
  outfit_id: string;
  outfit_items: OutfitItem[];
  score: number;
  explanation: string;
  outfit_category: string;
}

/** Response from GET /recommendations (outfit engine). */
export interface OutfitRecommendationResponse {
  recommendations: OutfitRecommendationItem[];
}

// ── Outfit feedback ──

export interface OutfitFeedbackRequest {
  outfit_id: string;
  feedback: "like" | "dislike";
}

export interface OutfitFeedbackResponse {
  feedback: string;
}

// ── Outfit favorites ──

export interface OutfitFavoriteRequest {
  outfit_id: string;
  outfit_data: OutfitRecommendationItem;
}

export interface OutfitFavoriteResponse {
  id: string;
  outfit_id: string;
  created_at: string;
}

export interface OutfitFavoriteItem {
  id: string;
  outfit_id: string;
  outfit_data: OutfitRecommendationItem;
  created_at: string;
}
