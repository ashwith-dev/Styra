import type { SavedLook } from "@/features/looks/types/looks";
import * as storage from "@/lib/storage/savedLooks";

/**
 * Saved looks are local-only (there is no remote table for them), so they
 * must NOT go through the mutation queue: queue handlers would replay the
 * same local write a second time, producing duplicate looks.
 */
export async function fetchSavedLooks(): Promise<SavedLook[]> {
  return storage.getSavedLooks();
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
  await storage.deleteSavedLook(id);
}
