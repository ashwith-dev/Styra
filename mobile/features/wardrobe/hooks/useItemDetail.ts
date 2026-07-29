import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import * as api from "@/lib/api";
import { buildAttributeUpdatePayload } from "@/lib/attributes";
import { getUserFacingMessage } from "@/lib/errors";
import type { ClothingItemDetail } from "@/lib/types";

export type DetailScreenState = "loading" | "loaded" | "error" | "editing" | "saving" | "deleting";

interface UseItemDetailReturn {
  item: ClothingItemDetail | null;
  state: DetailScreenState;
  error: string | null;
  /** Draft edits keyed by attribute field name */
  edits: Record<string, string>;
  setEditField: (key: string, value: string) => void;
  /** Read current value for a field — from edits if touched, else from item */
  getFieldValue: (key: string) => string;
  startEditing: () => void;
  cancelEditing: () => void;
  saveEdits: () => Promise<void>;
  handleDelete: () => void;
  reload: () => Promise<void>;
}

/**
 * Encapsulates all state and side-effects for the Clothing Detail screen.
 *
 * State machine:
 *   loading → loaded → editing → saving → loaded
 *                             ↓
 *                          (cancel) → loaded
 *   loading → error → (retry) → loading
 *   loaded → (delete) → wardrobe
 */
export function useItemDetail(id: string): UseItemDetailReturn {
  const [item, setItem] = useState<ClothingItemDetail | null>(null);
  const [state, setState] = useState<DetailScreenState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── Load ──

  const reload = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const data = await api.getClothingItem(id);
      if (!mountedRef.current) return;
      setItem(data);
      setState("loaded");
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getUserFacingMessage(err));
      setState("error");
    }
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // ── Field helpers ──

  const getFieldValue = useCallback(
    (key: string): string => {
      if (edits[key] !== undefined) return edits[key];
      const attrs = item?.attributes ?? {};
      const val = (attrs as Record<string, unknown>)[key];
      if (val && typeof val === "object" && "value" in val) {
        return String((val as { value: unknown }).value ?? "");
      }
      if (typeof val === "string") return val;
      return "";
    },
    [edits, item],
  );

  const setEditField = useCallback((key: string, value: string): void => {
    setEdits((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Edit actions ──

  const startEditing = useCallback(() => {
    setEdits({});
    setState("editing");
  }, []);

  const cancelEditing = useCallback(() => {
    setEdits({});
    setState("loaded");
  }, []);

  const saveEdits = useCallback(async () => {
    setState("saving");
    try {
      const attrs = buildAttributeUpdatePayload(item?.attributes ?? {}, edits);
      const updated = await api.updateClothingItem(id, attrs);
      if (!mountedRef.current) return;
      setItem(updated);
      setEdits({});
      setState("loaded");
    } catch (err) {
      if (!mountedRef.current) return;
      Alert.alert("Save Failed", getUserFacingMessage(err));
      setState("editing");
    }
  }, [item, edits, id]);

  // ── Delete ──

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your wardrobe?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setState("deleting");
            try {
              await api.deleteClothingItem(id);
              router.replace("/wardrobe");
            } catch (err) {
              if (!mountedRef.current) return;
              Alert.alert("Error", getUserFacingMessage(err));
              setState("loaded");
            }
          },
        },
      ],
    );
  }, [id]);

  return {
    item,
    state,
    error,
    edits,
    setEditField,
    getFieldValue,
    startEditing,
    cancelEditing,
    saveEdits,
    handleDelete,
    reload,
  };
}
