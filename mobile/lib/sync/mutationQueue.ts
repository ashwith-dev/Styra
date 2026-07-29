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

const MUTATION_QUEUE_KEY = "styra_mutation_queue_v1";

export async function getQueue(): Promise<SyncOperation[]> {
  try {
    const json = await SecureStore.getItemAsync(MUTATION_QUEUE_KEY);
    if (!json) return [];
    const ops = JSON.parse(json) as SyncOperation[];
    return ops.sort((a, b) => a.priority - b.priority);
  } catch {
    return [];
  }
}

export async function saveQueue(queue: SyncOperation[]): Promise<void> {
  try {
    await SecureStore.setItemAsync(MUTATION_QUEUE_KEY, JSON.stringify(queue));
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
    await SecureStore.deleteItemAsync(MUTATION_QUEUE_KEY);
  } catch (err) {
    console.error("Failed to clear mutation queue:", err);
  }
}
