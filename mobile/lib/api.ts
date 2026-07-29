import axios, { AxiosError, type AxiosInstance } from "axios";
import { supabase } from "./supabase";
import type {
  AnalyzeClothingResponse,
  SavedClothingItem,
  ClothingItemBrief,
  ClothingItemDetail,
  OutfitRecommendationResponse,
  OutfitFeedbackRequest,
  OutfitFavoriteRequest,
  OutfitFavoriteResponse,
  OutfitFavoriteItem,
} from "./types";
import { AppError } from "./errors";

import { Platform } from "react-native";

const DEFAULT_API_URL = Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";
const rawUrl = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
const API_URL = Platform.OS === "android" && rawUrl.includes("localhost") ? rawUrl.replace("localhost", "10.0.2.2") : rawUrl;
const TIMEOUT_MS = 30_000;

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_URL,
    timeout: TIMEOUT_MS,
    headers: { "Content-Type": "application/json" },
  });

  // ── Request interceptor: attach JWT ──
  client.interceptors.request.use(async (config) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ── Response interceptor: normalize errors ──
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ detail?: string | { error?: string; message?: string } }>) => {
      if (error.response) {
        const status = error.response.status;

        // Session rejected by the server: clear it locally so the root
        // navigator redirects to sign-in instead of leaving a dead session.
        if (status === 401) {
          // Do not force local sign out on 401 to prevent bouncing loops
        }

        const detail = error.response.data?.detail;
        const message =
          typeof detail === "string"
            ? detail
            : detail?.error || detail?.message || `Request failed (${status})`;

        throw new AppError(message, status, error.response.data as Record<string, unknown>);
      }

      // Network error (no response received)
      throw new AppError(
        "Unable to connect to the server. Please check your connection.",
        0,
      );
    },
  );

  return client;
}

const api = createClient();

export const API_VERSION = "v1";

// ── Analyze ──

export async function analyzeClothing(
  photoUri: string,
  signal?: AbortSignal,
): Promise<AnalyzeClothingResponse> {
  const form = new FormData();
  form.append("file", {
    uri: photoUri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as unknown as Blob);

  const { data } = await api.post<AnalyzeClothingResponse>(
    "/analyze-clothing",
    form,
    { headers: { "Content-Type": "multipart/form-data" }, timeout: 120_000, signal },
  );
  return data;
}

// ── Save ──

export async function saveClothing(
  pipelineToken: string,
  attributes: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<SavedClothingItem> {
  const { data } = await api.post<SavedClothingItem>(
    "/clothing",
    { pipeline_token: pipelineToken, attributes },
    { signal },
  );
  return data;
}

// ── List ──

export async function listClothing(signal?: AbortSignal): Promise<ClothingItemBrief[]> {
  const { data } = await api.get<{ items: ClothingItemBrief[]; total_count?: number }>("/clothing", { signal });
  return data.items;
}

// ── Detail ──

export async function getClothingItem(
  id: string,
  signal?: AbortSignal,
): Promise<ClothingItemDetail> {
  const { data } = await api.get<ClothingItemDetail>(`/clothing/${id}`, { signal });
  return data;
}

// ── Update ──

export async function updateClothingItem(
  id: string,
  attributes: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<ClothingItemDetail> {
  const { data } = await api.patch<ClothingItemDetail>(
    `/clothing/${id}`,
    { attributes },
    { signal },
  );
  return data;
}

// ── Delete ──

export async function deleteClothingItem(id: string, signal?: AbortSignal): Promise<void> {
  await api.delete(`/clothing/${id}`, { signal });
}

// ── Health (connectivity check) ──

export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    await api.get("/health", { timeout: 5_000, signal });
    return true;
  } catch {
    return false;
  }
}

// ── Outfit Recommendations (Phase 4A) ──

export async function getOutfitRecommendations(params?: {
  occasion?: string;
  season?: string;
}): Promise<OutfitRecommendationResponse> {
  const { data } = await api.get<OutfitRecommendationResponse>(
    "/recommendations",
    { params },
  );
  return data;
}

// ── Outfit Feedback ──

export async function submitOutfitFeedback(
  params: OutfitFeedbackRequest,
): Promise<void> {
  await api.post("/recommendations/feedback", params);
}

// ── Outfit Favorites ──

export async function addOutfitFavorite(
  params: OutfitFavoriteRequest,
): Promise<OutfitFavoriteResponse> {
  const { data } = await api.post<OutfitFavoriteResponse>(
    "/recommendations/favorites",
    params,
  );
  return data;
}

export async function removeOutfitFavorite(outfitId: string): Promise<void> {
  await api.delete(`/recommendations/favorites/${outfitId}`);
}

export async function listOutfitFavorites(): Promise<OutfitFavoriteItem[]> {
  const { data } = await api.get<OutfitFavoriteItem[]>(
    "/recommendations/favorites",
  );
  return data;
}

export async function checkOutfitFavorite(
  outfitId: string,
): Promise<boolean> {
  const { data } = await api.get<{ saved: boolean }>(
    `/recommendations/favorites/${outfitId}`,
  );
  return data.saved;
}
