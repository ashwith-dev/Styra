import * as api from "@/lib/api";
import type { AnalyzeClothingResponse, SavedClothingItem } from "@/lib/types";

export async function analyzePhoto(
  photoUri: string,
  signal?: AbortSignal,
): Promise<AnalyzeClothingResponse> {
  return api.analyzeClothing(photoUri, signal);
}

export async function saveAnalyzedClothing(
  pipelineToken: string,
  attributes: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<SavedClothingItem> {
  return api.saveClothing(pipelineToken, attributes, signal);
}
