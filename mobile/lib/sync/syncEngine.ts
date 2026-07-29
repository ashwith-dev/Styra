import { isOnline, subscribeNetworkStatus } from "../network/networkStatus";
import {
  getQueue,
  incrementOpAttempts,
  removeOp,
  type SyncOperation,
} from "./mutationQueue";

type OpHandler = (op: SyncOperation) => Promise<boolean>;
const handlers = new Map<string, OpHandler>();

/**
 * Register an executor for a specific SyncOpType.
 * Repositories register their sync handlers here.
 */
export function registerSyncHandler(type: string, handler: OpHandler): void {
  handlers.set(type, handler);
}

let isSyncing = false;
const MAX_ATTEMPTS = 5;

/**
 * Generic Sync Engine.
 * Executes queued SyncOperations in priority order when online.
 * Completely generic — does not contain feature business logic.
 */
export async function processSyncQueue(): Promise<void> {
  if (isSyncing || !isOnline()) return;

  isSyncing = true;
  try {
    const queue = await getQueue();
    for (const op of queue) {
      if (!isOnline()) break;

      if (op.attempts >= MAX_ATTEMPTS) {
        console.warn(`Sync operation ${op.id} exceeded max attempts. Removing.`);
        await removeOp(op.id);
        continue;
      }

      const handler = handlers.get(op.type);
      if (!handler) {
        console.warn(`No handler registered for sync operation type: ${op.type}`);
        continue;
      }

      try {
        const success = await handler(op);
        if (success) {
          await removeOp(op.id);
        } else {
          await incrementOpAttempts(op.id);
        }
      } catch (err) {
        console.error(`Failed to process sync op ${op.id}:`, err);
        await incrementOpAttempts(op.id);
      }
    }
  } finally {
    isSyncing = false;
  }
}

// Auto-trigger sync queue processing whenever network transitions to Online
subscribeNetworkStatus((online) => {
  if (online) {
    void processSyncQueue();
  }
});
