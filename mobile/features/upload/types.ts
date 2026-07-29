import type { AIPipelineResult, AttributeConfidence } from "@/lib/types";

/**
 * Single Source of Truth for the Upload Flow.
 * Contains selected image, AI analysis output, and current editable state.
 */
export interface DraftClothingItem {
  imageUri: string | null;
  pipelineToken: string | null;
  segmentedImageUrl: string | null;
  aiResult: AIPipelineResult | null;
  attributes: Record<string, string>;
  season: AttributeConfidence[];
  occasion: AttributeConfidence[];
  tags: string[];
}
