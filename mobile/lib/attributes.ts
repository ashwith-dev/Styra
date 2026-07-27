/**
 * Builds the attributes payload for PATCH /clothing/:id.
 *
 * Starts from the item's existing attributes so untouched fields keep their
 * original confidence scores and non-editable keys (color_hex, season,
 * occasion, ...) are preserved. Only fields present in `edits` are overlaid:
 * a non-empty value is marked as user-verified (confidence 1.0), an empty
 * value removes the attribute.
 */
export function buildAttributeUpdatePayload(
  existing: Record<string, unknown>,
  edits: Record<string, string>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...existing };

  for (const [key, raw] of Object.entries(edits)) {
    const value = raw.trim();
    if (value) {
      const previous = payload[key];
      payload[key] = {
        ...(previous && typeof previous === "object" ? previous : {}),
        value,
        confidence: 1.0,
      };
    } else {
      delete payload[key];
    }
  }

  return payload;
}
