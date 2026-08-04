import { useCallback, useState } from "react";
import * as api from "@/lib/api";
import { getUserFacingMessage } from "@/lib/errors";
import type { AIPipelineResult } from "@/lib/types";
import { UPLOAD_SINGLE_ATTRS } from "../config";
import type { DraftClothingItem } from "../types";

const INITIAL_DRAFT: DraftClothingItem = {
  imageUri: null,
  pipelineToken: null,
  segmentedImageUrl: null,
  aiResult: null,
  attributes: {},
  season: [],
  occasion: [],
  tags: [],
};

export function useUploadState(initialData?: {
  pipelineToken: string;
  segmentedImageUrl: string;
  aiResult: AIPipelineResult;
}) {
  const [draft, setDraft] = useState<DraftClothingItem>(() => {
    if (!initialData) return INITIAL_DRAFT;

    // Seed the form with every AttributeConfidence-shaped field the AI
    // returned — not just the fields in UPLOAD_SINGLE_ATTRS — so detected
    // values (size, secondary_color, warmth, ...) appear in the form.
    const initialAttrs: Record<string, string> = {};
    for (const [key, val] of Object.entries(initialData.aiResult)) {
      if (val && typeof val === "object" && !Array.isArray(val) && "value" in val) {
        const v = (val as { value: unknown }).value;
        if (v != null && v !== "") initialAttrs[key] = String(v);
      } else if (typeof val === "string" && (key === "brand" || key === "description")) {
        if (val) initialAttrs[key] = val;
      }
    }

    return {
      imageUri: null,
      pipelineToken: initialData.pipelineToken,
      segmentedImageUrl: initialData.segmentedImageUrl,
      aiResult: initialData.aiResult,
      attributes: initialAttrs,
      season: initialData.aiResult.season || [],
      occasion: initialData.aiResult.occasion || [],
      tags: [],
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /** Read current value for an attribute field */
  const getValue = useCallback(
    (key: string): string => {
      return draft.attributes[key] ?? "";
    },
    [draft.attributes],
  );

  /** Update a single attribute value */
  const setAttribute = useCallback((key: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value,
      },
    }));

    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  /** Form field validation */
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of UPLOAD_SINGLE_ATTRS) {
      if (field.validate) {
        const val = draft.attributes[field.key] ?? "";
        const err = field.validate(val);
        if (err) newErrors[field.key] = err;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [draft.attributes]);

  /** Build payload object for saving */
  const buildPayload = useCallback((): Record<string, unknown> => {
    const payload: Record<string, unknown> = {};

    // Every edited field is saved — iterating only UPLOAD_SINGLE_ATTRS
    // here silently dropped edits to taxonomy fields like size or warmth.
    for (const [key, rawVal] of Object.entries(draft.attributes)) {
      const val = rawVal.trim();
      if (val) {
        payload[key] = { value: val, confidence: 1.0 };
      }
    }

    if (draft.season.length > 0) payload.season = draft.season;
    if (draft.occasion.length > 0) payload.occasion = draft.occasion;

    return payload;
  }, [draft]);

  /**
   * Pure save action: calls api.saveClothing and returns success state.
   * NO navigation performed inside this hook.
   */
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (!draft.pipelineToken) {
      setSaveError("Missing pipeline token.");
      return false;
    }

    if (!validate()) {
      return false;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const payload = buildPayload();
      await api.saveClothing(draft.pipelineToken, payload);
      setSaving(false);
      return true;
    } catch (err) {
      setSaving(false);
      setSaveError(getUserFacingMessage(err));
      return false;
    }
  }, [draft.pipelineToken, validate, buildPayload]);

  /** Reset draft completely (on cancellation) */
  const resetDraft = useCallback(() => {
    setDraft(INITIAL_DRAFT);
    setErrors({});
    setSaveError(null);
  }, []);

  return {
    draft,
    getValue,
    setAttribute,
    errors,
    saving,
    saveError,
    saveDraft,
    resetDraft,
    setSaveError,
  };
}
