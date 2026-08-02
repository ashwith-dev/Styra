import * as SecureStore from "expo-secure-store";
import { generateId } from "@/lib/uuid";
import type { SavedLook } from "@/features/looks/types/looks";

export interface CacheMetadata<T> {
  data: T;
  lastUpdated: string;
  version: number;
}

const SAVED_LOOKS_STORAGE_KEY = "styra_saved_looks_v1";
const LOOKS_CACHE_VERSION = 1;

export async function getSavedLooksMetadata(): Promise<CacheMetadata<SavedLook[]> | null> {
  try {
    const json = await SecureStore.getItemAsync(SAVED_LOOKS_STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json) as CacheMetadata<SavedLook[]>;
  } catch (err) {
    console.warn("Failed to read saved looks from storage:", err);
    return null;
  }
}

export async function getSavedLooks(): Promise<SavedLook[]> {
  const meta = await getSavedLooksMetadata();
  return meta?.data ?? [];
}

export async function getSavedLookById(id: string): Promise<SavedLook | null> {
  const looks = await getSavedLooks();
  return looks.find((l) => l.id === id) ?? null;
}

export async function saveSavedLooks(looks: SavedLook[]): Promise<void> {
  const metadata: CacheMetadata<SavedLook[]> = {
    data: looks,
    lastUpdated: new Date().toISOString(),
    version: LOOKS_CACHE_VERSION,
  };
  try {
    await SecureStore.setItemAsync(
      SAVED_LOOKS_STORAGE_KEY,
      JSON.stringify(metadata),
    );
  } catch (err) {
    console.error("Failed to write saved looks to storage:", err);
    throw new Error("Could not persist saved look.", { cause: err });
  }
}

export async function createSavedLook(
  data: Omit<SavedLook, "id" | "created_at" | "updated_at">,
): Promise<SavedLook> {
  const looks = await getSavedLooks();
  const now = new Date().toISOString();
  const newLook: SavedLook = {
    ...data,
    id: generateId(),
    created_at: now,
    updated_at: now,
  };

  const updatedLooks = [newLook, ...looks];
  await saveSavedLooks(updatedLooks);
  return newLook;
}

export async function updateSavedLook(
  id: string,
  updates: Partial<Omit<SavedLook, "id" | "created_at">>,
): Promise<SavedLook> {
  const looks = await getSavedLooks();
  const index = looks.findIndex((l) => l.id === id);

  if (index === -1) {
    throw new Error("Saved look not found.");
  }

  const existing = looks[index];
  const updatedLook: SavedLook = {
    ...existing,
    ...updates,
    id: existing.id,
    created_at: existing.created_at,
    updated_at: new Date().toISOString(),
  };

  looks[index] = updatedLook;
  await saveSavedLooks(looks);
  return updatedLook;
}

export async function deleteSavedLook(id: string): Promise<void> {
  const looks = await getSavedLooks();
  const filtered = looks.filter((l) => l.id !== id);
  await saveSavedLooks(filtered);
}

export async function clearSavedLooks(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SAVED_LOOKS_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear saved looks from storage:", err);
  }
}

