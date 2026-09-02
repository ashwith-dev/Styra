import { describe, expect, it } from "vitest";
import { buildAttributeUpdatePayload } from "../attributes";

const existingAttributes: Record<string, unknown> = {
  category: { value: "top", confidence: 0.62 },
  type: { value: "t-shirt", confidence: 0.88 },
  color: { value: "navy", confidence: 0.74 },
  color_hex: { value: "#000080", confidence: 0.9 },
  season: [{ value: "summer", confidence: 0.7 }],
  occasion: [{ value: "casual", confidence: 0.65 }],
  brand: "Nike",
};

describe("buildAttributeUpdatePayload", () => {
  it("preserves confidence scores of fields the user did not touch", () => {
    const payload = buildAttributeUpdatePayload(existingAttributes, {
      color: "black",
    });

    expect(payload.category).toEqual({ value: "top", confidence: 0.62 });
    expect(payload.type).toEqual({ value: "t-shirt", confidence: 0.88 });
    expect(payload.brand).toBe("Nike");
  });

  it("preserves non-editable attributes (color_hex, season, occasion)", () => {
    const payload = buildAttributeUpdatePayload(existingAttributes, {
      color: "black",
    });

    expect(payload.color_hex).toEqual({ value: "#000080", confidence: 0.9 });
    expect(payload.season).toEqual([{ value: "summer", confidence: 0.7 }]);
    expect(payload.occasion).toEqual([{ value: "casual", confidence: 0.65 }]);
  });

  it("marks edited fields as user-verified with confidence 1.0", () => {
    const payload = buildAttributeUpdatePayload(existingAttributes, {
      color: "black",
    });

    expect(payload.color).toEqual({ value: "black", confidence: 1.0 });
  });

  it("trims whitespace from edited values", () => {
    const payload = buildAttributeUpdatePayload(existingAttributes, {
      color: "  forest green  ",
    });

    expect(payload.color).toEqual({ value: "forest green", confidence: 1.0 });
  });

  it("removes an attribute when the user clears its value", () => {
    const payload = buildAttributeUpdatePayload(existingAttributes, {
      color: "   ",
    });

    expect("color" in payload).toBe(false);
    expect(payload.category).toEqual({ value: "top", confidence: 0.62 });
  });

  it("replaces plain-string attributes with an attribute object when edited", () => {
    const payload = buildAttributeUpdatePayload(existingAttributes, {
      brand: "Adidas",
    });

    expect(payload.brand).toEqual({ value: "Adidas", confidence: 1.0 });
  });

  it("adds attributes that did not exist before", () => {
    const payload = buildAttributeUpdatePayload(existingAttributes, {
      material: "cotton",
    });

    expect(payload.material).toEqual({ value: "cotton", confidence: 1.0 });
  });

  it("returns a copy and does not mutate the input", () => {
    const before = JSON.parse(JSON.stringify(existingAttributes));
    buildAttributeUpdatePayload(existingAttributes, { color: "black" });

    expect(existingAttributes).toEqual(before);
  });
});
