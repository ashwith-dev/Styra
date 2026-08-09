import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import { generateId } from "@/lib/uuid";
import type { SavedLook } from "@/features/looks/types/looks";

export interface CacheMetadata<T> {
  data: T;
  lastUpdated: string;
  version: number;
}

// Saved looks are user data: stored in documentDirectory (persisted and
// backed up), not SecureStore — SecureStore values are capped at ~2 KB,
// which a handful of looks with image URLs exceeds silently.
const SAVED_LOOKS_FILE = `${FileSystem.documentDirectory}styra_saved_looks_v1.json`;
const LEGACY_SECURESTORE_KEY = "styra_saved_looks_v1";
const LOOKS_CACHE_VERSION = 1;

async function readRaw(): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(SAVED_LOOKS_FILE);
    if (info.exists) {
      const json = await FileSystem.readAsStringAsync(SAVED_LOOKS_FILE);
      if (json) return json;
      return null;
    }

    // One-time migration from the legacy SecureStore location.
    const legacy = await SecureStore.getItemAsync(LEGACY_SECURESTORE_KEY);
    if (legacy) {
      await FileSystem.writeAsStringAsync(SAVED_LOOKS_FILE, legacy);
      await SecureStore.deleteItemAsync(LEGACY_SECURESTORE_KEY).catch(() => {});
      return legacy;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSavedLooksMetadata(): Promise<CacheMetadata<SavedLook[]> | null> {
  try {
    const json = await readRaw();
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
    await FileSystem.writeAsStringAsync(SAVED_LOOKS_FILE, JSON.stringify(metadata));
  } catch (err) {
    console.error("Failed to write saved looks to storage:", err);
    throw new Error("Could not persist saved look.", { cause: err });
  }
}

export async function createSavedLook(
  data: Omit<SavedLook, "id" | "created_at" | "updated_at">,
  options?: { id?: string },
): Promise<SavedLook> {
  const looks = await getSavedLooks();
  const now = new Date().toISOString();
  const newLook: SavedLook = {
    ...data,
    id: options?.id ?? generateId(),
    created_at: now,
    updated_at: now,
  };

  // An explicit id makes the write idempotent: re-saving the same look
  // replaces the previous entry instead of accumulating duplicates.
  const rest = options?.id ? looks.filter((l) => l.id !== newLook.id) : looks;
  const updatedLooks = [newLook, ...rest];
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
    await FileSystem.deleteAsync(SAVED_LOOKS_FILE, { idempotent: true });
    await SecureStore.deleteItemAsync(LEGACY_SECURESTORE_KEY).catch(() => {});
  } catch (err) {
    console.error("Failed to clear saved looks from storage:", err);
  }
}
