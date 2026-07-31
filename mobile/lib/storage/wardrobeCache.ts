import * as FileSystem from "expo-file-system";
import type { ClothingItemBrief } from "@/lib/types";

export interface CacheMetadata<T> {
  data: T;
  lastUpdated: string;
  version: number;
}

const WARDROBE_CACHE_FILE = `${FileSystem.documentDirectory}styra_wardrobe_cache_v1.json`;
const WARDROBE_CACHE_VERSION = 1;

export async function getCachedWardrobe(): Promise<CacheMetadata<ClothingItemBrief[]> | null> {
  try {
    const info = await FileSystem.getInfoAsync(WARDROBE_CACHE_FILE);
    if (!info.exists) return null;
    const json = await FileSystem.readAsStringAsync(WARDROBE_CACHE_FILE);
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
    await FileSystem.writeAsStringAsync(WARDROBE_CACHE_FILE, JSON.stringify(metadata));
  } catch (err) {
    console.error("Failed to write wardrobe cache to storage:", err);
  }
}

export async function clearWardrobeCache(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(WARDROBE_CACHE_FILE);
    if (info.exists) {
      await FileSystem.deleteAsync(WARDROBE_CACHE_FILE, { idempotent: true });
    }
  } catch (err) {
    console.error("Failed to clear wardrobe cache:", err);
  }
}
