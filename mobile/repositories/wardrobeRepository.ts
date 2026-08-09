import * as api from "@/lib/api";
import { isOnline } from "@/lib/network/networkStatus";
import * as wardrobeCache from "@/lib/storage/wardrobeCache";
import type { ClothingItemBrief, ClothingItemDetail } from "@/lib/types";

/**
 * Wardrobe Repository combining API, Cache, and Network Status.
 * Implements SWR (Stale-While-Revalidate) pattern for 0ms initial latency.
 */
export async function getWardrobeItems(
  signal?: AbortSignal,
): Promise<{ items: ClothingItemBrief[]; fromCache: boolean }> {
  const cachedMeta = await wardrobeCache.getCachedWardrobe();
  const cachedItems = cachedMeta?.data ?? [];

  if (!isOnline()) {
    return { items: cachedItems, fromCache: true };
  }

  try {
    const remoteItems = await api.listClothing(signal);
    await wardrobeCache.setCachedWardrobe(remoteItems);
    return { items: remoteItems, fromCache: false };
  } catch (err) {
    if (cachedItems.length > 0) {
      return { items: cachedItems, fromCache: true };
    }
    throw err;
  }
}

export async function getClothingItemDetail(
  id: string,
  signal?: AbortSignal,
): Promise<ClothingItemDetail> {
  return api.getClothingItem(id, signal);
}

function revalidateCacheInBackground(): void {
  if (!isOnline()) return;
  void api
    .listClothing()
    .then(wardrobeCache.setCachedWardrobe)
    .catch(() => {
      // Stale cache is acceptable; the next screen refresh revalidates.
    });
}

export async function updateClothingItemAttributes(
  id: string,
  attributes: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<ClothingItemDetail> {
  const updated = await api.updateClothingItem(id, attributes, signal);
  revalidateCacheInBackground();
  return updated;
}

export async function removeClothingItem(
  id: string,
  signal?: AbortSignal,
): Promise<void> {
  await api.deleteClothingItem(id, signal);
  revalidateCacheInBackground();
}
