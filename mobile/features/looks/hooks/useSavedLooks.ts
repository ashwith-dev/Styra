import { useCallback, useEffect, useState } from "react";
import * as looksRepo from "@/repositories/looksRepository";
import type {
  SavedLook,
  SavedLookViewModel,
  SaveState,
} from "../types/looks";

export function useSavedLooks(): SavedLookViewModel {
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setSaveState("saving");
    setError(null);
    try {
      const data = await looksRepo.fetchSavedLooks();
      setLooks(data);
      setSaveState("idle");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load looks.");
      setSaveState("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getLookById = useCallback(
    (id: string): SavedLook | null => {
      return looks.find((l) => l.id === id) ?? null;
    },
    [looks],
  );

  const create = useCallback(
    async (
      data: Omit<SavedLook, "id" | "created_at" | "updated_at">,
    ): Promise<SavedLook | null> => {
      setSaveState("saving");
      setError(null);
      try {
        const created = await looksRepo.createLook(data);
        setLooks((prev) => [created, ...prev]);
        setSaveState("success");
        return created;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to save look.");
        setSaveState("error");
        return null;
      }
    },
    [],
  );

  const update = useCallback(
    async (
      id: string,
      updates: Partial<Omit<SavedLook, "id" | "created_at">>,
    ): Promise<SavedLook | null> => {
      setSaveState("saving");
      setError(null);
      try {
        const updated = await looksRepo.updateLook(id, updates);
        setLooks((prev) =>
          prev.map((l) => (l.id === id ? updated : l)),
        );
        setSaveState("success");
        return updated;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to update look.",
        );
        setSaveState("error");
        return null;
      }
    },
    [],
  );

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setSaveState("deleting");
    setError(null);
    try {
      await looksRepo.deleteLook(id);
      setLooks((prev) => prev.filter((l) => l.id !== id));
      setSaveState("success");
      return true;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to delete look.",
      );
      setSaveState("error");
      return false;
    }
  }, []);

  return {
    looks,
    saveState,
    error,
    actions: {
      create,
      update,
      delete: remove,
      refresh,
      getLookById,
    },
  };
}
