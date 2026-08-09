import type { SavedLook } from "@/features/looks/types/looks";
import * as storage from "@/lib/storage/savedLooks";
import { listOutfitFavorites, removeOutfitFavorite } from "@/lib/api";

export async function fetchSavedLooks(): Promise<SavedLook[]> {
  const localLooks = await storage.getSavedLooks();

  try {
    const backendFavs = await listOutfitFavorites();
    const backendLooks: SavedLook[] = backendFavs.map((fav) => {
      const items = fav.outfit_data?.outfit_items || [];
      return {
        id: fav.outfit_id || fav.id,
        name: `Outfit ${fav.outfit_id ? fav.outfit_id.slice(-4) : ""}`,
        category: "Saved Look",
        season: "All Season",
        tags: ["Favorite"],
        source: "ai",
        items: items.map((item) => ({
          id: item.id,
          clothing_item_id: item.id,
          thumbnail_url: item.thumbnail_url || (item as any).image_url || null,
          segmented_image_url: (item as any).image_url || item.thumbnail_url || null,
        })),
        created_at: fav.created_at || new Date().toISOString(),
        updated_at: fav.created_at || new Date().toISOString(),
      };
    });

    // Merge backend looks and local looks uniquely by ID
    const mergedMap = new Map<string, SavedLook>();
    for (const look of [...localLooks, ...backendLooks]) {
      mergedMap.set(look.id, look);
    }
    return Array.from(mergedMap.values());
  } catch {
    return localLooks;
  }
}

export async function createLook(
  data: Omit<SavedLook, "id" | "created_at" | "updated_at">,
): Promise<SavedLook> {
  return storage.createSavedLook(data);
}

export async function updateLook(
  id: string,
  updates: Partial<Omit<SavedLook, "id" | "created_at">>,
): Promise<SavedLook> {
  return storage.updateSavedLook(id, updates);
}

export async function deleteLook(id: string): Promise<void> {
  try {
    await removeOutfitFavorite(id);
  } catch {
    // best-effort
  }
  await storage.deleteSavedLook(id);
}
