import * as SecureStore from "expo-secure-store";
import type { ClothingItemBrief } from "@/lib/types";

export interface CacheMetadata<T> {
  data: T;
  lastUpdated: string;
  version: number;
}

const WARDROBE_CACHE_KEY = "styra_wardrobe_cache_v1";
const WARDROBE_CACHE_VERSION = 1;

export async function getCachedWardrobe(): Promise<CacheMetadata<ClothingItemBrief[]> | null> {
  try {
    const json = await SecureStore.getItemAsync(WARDROBE_CACHE_KEY);
    if (!json) return null;
    return JSON.parse(json) as CacheMetadata<ClothingItemBrief[]>;
  } catch {
    return null;
  }
}

export async function setCachedWardrobe(data: ClothingItemBrief[]): Promise<void> {
  const metadata: CacheMetadata<ClothingItemBrief[]> = {
    data,
    lastUpdated: new Date().toISOString(),
    version: WARDROBE_CACHE_VERSION,
  };
  try {
    await SecureStore.setItemAsync(WARDROBE_CACHE_KEY, JSON.stringify(metadata));
  } catch (err) {
    console.error("Failed to write wardrobe cache to storage:", err);
  }
}

export async function clearWardrobeCache(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(WARDROBE_CACHE_KEY);
  } catch (err) {
    console.error("Failed to clear wardrobe cache:", err);
  }
}
