/**
 * Deterministic unique ID generation using crypto API.
 * Uses crypto.randomUUID() where available (Expo, modern RN),
 * with a fallback for environments where it's not.
 */

let counter = 0;
const PREFIX = "styra";

/**
 * Generate a unique identifier.
 * Uses crypto.randomUUID on platforms that support it,
 * falls back to a timestamp+counter combo otherwise.
 */
export function generateId(): string {
  try {
    // crypto.randomUUID() is available in Hermes/Expo environments
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `${PREFIX}_${crypto.randomUUID()}`;
    }
  } catch {
    // Fall through to fallback
  }
  // Fallback: timestamp + counter + random suffix
  counter += 1;
  return `${PREFIX}_${Date.now()}_${counter}_${Math.random().toString(36).substring(2, 8)}`;
}
