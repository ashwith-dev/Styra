/**
 * AI Model & Capabilities Configuration.
 * Prompts belong ENTIRELY on the FastAPI backend.
 * This file configures model versions, DTO contracts, and feature flags.
 */

export const AI_MODEL_VERSION = "v1.0";

export interface AICapabilityFlags {
  recommendations: boolean;
  wardrobeInsights: boolean;
  weatherStyling: boolean;
  explanationGeneration: boolean;
}

export const AI_CAPABILITIES: AICapabilityFlags = {
  recommendations: true,
  wardrobeInsights: true,
  weatherStyling: true,
  explanationGeneration: true,
};
