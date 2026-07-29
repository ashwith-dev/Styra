import type { SavedLook } from "@/features/looks/types/looks";
import { isOnline } from "@/lib/network/networkStatus";
import * as storage from "@/lib/storage/savedLooks";
import { enqueueOp } from "@/lib/sync/mutationQueue";
import { registerSyncHandler } from "@/lib/sync/syncEngine";

// Priority 2 for Saved Looks mutations
const LOOKS_PRIORITY = 2;

// Register sync handler for queue operations
registerSyncHandler("CREATE_LOOK", async (op) => {
  try {
    await storage.createSavedLook(
      op.payload.data as Omit<SavedLook, "id" | "created_at" | "updated_at">,
    );
    return true;
  } catch {
    return false;
  }
});

registerSyncHandler("UPDATE_LOOK", async (op) => {
  try {
    await storage.updateSavedLook(
      op.payload.id as string,
      op.payload.updates as Partial<SavedLook>,
    );
    return true;
  } catch {
    return false;
  }
});

registerSyncHandler("DELETE_LOOK", async (op) => {
  try {
    await storage.deleteSavedLook(op.payload.id as string);
    return true;
  } catch {
    return false;
  }
});

export async function fetchSavedLooks(): Promise<SavedLook[]> {
  return storage.getSavedLooks();
}

export async function createLook(
  data: Omit<SavedLook, "id" | "created_at" | "updated_at">,
): Promise<SavedLook> {
  if (!isOnline()) {
    // Queue mutation for online sync
    await enqueueOp("CREATE_LOOK", LOOKS_PRIORITY, { data });
  }
  // Optimistic UI update via storage adapter
  return storage.createSavedLook(data);
}

export async function updateLook(
  id: string,
  updates: Partial<Omit<SavedLook, "id" | "created_at">>,
): Promise<SavedLook> {
  if (!isOnline()) {
    await enqueueOp("UPDATE_LOOK", LOOKS_PRIORITY, { id, updates });
  }
  return storage.updateSavedLook(id, updates);
}

export async function deleteLook(id: string): Promise<void> {
  if (!isOnline()) {
    await enqueueOp("DELETE_LOOK", LOOKS_PRIORITY, { id });
  }
  await storage.deleteSavedLook(id);
}
