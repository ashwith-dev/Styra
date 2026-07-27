import { useCallback, useState } from "react";
import type { ClothingItemBrief } from "../lib/types";
import * as api from "../lib/api";
import { AppError } from "../lib/errors";

export function useWardrobe() {
  const [items, setItems] = useState<ClothingItemBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listClothing();
      setItems(data);
    } catch (err) {
      const msg = err instanceof AppError ? err.message : "Failed to load wardrobe";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (id: string) => {
    try {
      await api.deleteClothingItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      const msg = err instanceof AppError ? err.message : "Failed to remove item";
      throw new Error(msg);
    }
  }, []);

  return { items, loading, error, refresh, removeItem };
}
