/**
 * Deterministic unique ID generation using crypto API.
 * Uses crypto.randomUUID() where available (Expo, modern RN),
 * with a fallback that still uses crypto.getRandomValues for security.
 */

let counter = 0;
const PREFIX = "styra";

/**
 * Generate a secure unique identifier.
 * Uses crypto.randomUUID on platforms that support it,
 * falls back to crypto.getRandomValues with Base62 encoding.
 */
export function generateId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `${PREFIX}_${crypto.randomUUID()}`;
    }
  } catch {
    // Fall through to secure fallback
  }

  // Fallback: timestamp + counter + secure random via crypto.getRandomValues
  counter += 1;
  const randBytes = new Uint8Array(8);
  crypto.getRandomValues(randBytes);
  const randHex = Array.from(randBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${PREFIX}_${Date.now()}_${counter}_${randHex}`;
}
