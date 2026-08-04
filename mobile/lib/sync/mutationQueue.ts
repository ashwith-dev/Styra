import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import { generateId } from "@/lib/uuid";

export type SyncOpType =
  | "UPDATE_PROFILE"
  | "CREATE_LOOK"
  | "UPDATE_LOOK"
  | "DELETE_LOOK"
  | "UPDATE_PREFERENCES";

export type SyncPriority = 1 | 2 | 3 | 4;

export interface SyncOperation {
  id: string;
  type: SyncOpType;
  priority: SyncPriority;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
}

// The queue lives in documentDirectory, not SecureStore — queued payloads
// (e.g. look items with image URLs) exceed SecureStore's ~2 KB value cap.
const MUTATION_QUEUE_FILE = `${FileSystem.documentDirectory}styra_mutation_queue_v1.json`;
const LEGACY_SECURESTORE_KEY = "styra_mutation_queue_v1";

async function readRaw(): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(MUTATION_QUEUE_FILE);
    if (info.exists) {
      const json = await FileSystem.readAsStringAsync(MUTATION_QUEUE_FILE);
      if (json) return json;
      return null;
    }

    // One-time migration from the legacy SecureStore location.
    const legacy = await SecureStore.getItemAsync(LEGACY_SECURESTORE_KEY);
    if (legacy) {
      await FileSystem.writeAsStringAsync(MUTATION_QUEUE_FILE, legacy);
      await SecureStore.deleteItemAsync(LEGACY_SECURESTORE_KEY).catch(() => {});
      return legacy;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getQueue(): Promise<SyncOperation[]> {
  try {
    const json = await readRaw();
    if (!json) return [];
    const ops = JSON.parse(json) as SyncOperation[];
    return ops.sort((a, b) => a.priority - b.priority);
  } catch {
    return [];
  }
}

export async function saveQueue(queue: SyncOperation[]): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(MUTATION_QUEUE_FILE, JSON.stringify(queue));
  } catch (err) {
    console.error("Failed to write mutation queue to storage:", err);
  }
}

export async function enqueueOp(
  type: SyncOpType,
  priority: SyncPriority,
  payload: Record<string, unknown>,
): Promise<SyncOperation> {
  const queue = await getQueue();

  // Deduplicate: if an existing op matches type, priority, and primary key,
  // replace it instead of appending a duplicate.
  if (type === "UPDATE_PROFILE" || type === "UPDATE_PREFERENCES") {
    const existingIdx = queue.findIndex((op) => op.type === type && op.priority === priority);
    if (existingIdx !== -1) {
      queue[existingIdx] = {
        ...queue[existingIdx],
        payload,
        attempts: 0,
        createdAt: new Date().toISOString(),
      };
      await saveQueue(queue);
      return queue[existingIdx];
    }
  }

  // For idempotent operations on the same resource, remove previous entry
  if (type === "UPDATE_LOOK" || type === "DELETE_LOOK") {
    const lookupId = payload.id as string | undefined;
    if (lookupId) {
      const filtered = queue.filter(
        (op) => !(op.type === type && op.payload.id === lookupId),
      );
      if (filtered.length < queue.length) {
        queue.length = 0;
        queue.push(...filtered);
      }
    }
  }

  const op: SyncOperation = {
    id: generateId(),
    type,
    priority,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  queue.push(op);
  queue.sort((a, b) => a.priority - b.priority);
  await saveQueue(queue);
  return op;
}

export async function removeOp(opId: string): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter((op) => op.id !== opId);
  await saveQueue(filtered);
}

export async function incrementOpAttempts(opId: string): Promise<void> {
  const queue = await getQueue();
  const op = queue.find((o) => o.id === opId);
  if (op) {
    op.attempts += 1;
    await saveQueue(queue);
  }
}

export async function clearQueue(): Promise<void> {
  try {
    await FileSystem.deleteAsync(MUTATION_QUEUE_FILE, { idempotent: true });
    await SecureStore.deleteItemAsync(LEGACY_SECURESTORE_KEY).catch(() => {});
  } catch (err) {
    console.error("Failed to clear mutation queue:", err);
  }
}
