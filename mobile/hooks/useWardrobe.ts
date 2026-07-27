import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import type { ClothingItemBrief, ClothingItemDetail } from "../lib/types";
import * as api from "../lib/api";
import { AppError } from "../lib/errors";

// Module-level cache so other screens (e.g. Profile) can read wardrobe
// counts without instantiating a full hook and triggering an API call.
let _cachedWardrobeItems: ClothingItemBrief[] = [];

export function getCachedWardrobeCount(): number {
  return _cachedWardrobeItems.length;
}

export function getCachedWardrobeCategoryCount(): number {
  const cats = new Set<string>();
  for (const item of _cachedWardrobeItems) {
    const cat = (
      item.attributes as Record<string, unknown>
    )?.category as { value?: unknown } | undefined;
    if (cat?.value) cats.add(String(cat.value));
  }
  return cats.size;
}

export function useWardrobe() {
  const [items, setItems] = useState<ClothingItemBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // ── Fetch ──

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listClothing();
      _cachedWardrobeItems = data;
      setItems(data);
    } catch (err) {
      const msg = err instanceof AppError ? err.message : "Failed to load wardrobe";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Search + filter (client-side) ──

  const filteredItems = useMemo(() => {
    let result = items;

    if (categoryFilter) {
      result = result.filter((item) => {
        const cat = (item.attributes as any)?.category?.value;
        return cat === categoryFilter;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) => {
        const attrs = item.attributes || {};
        return Object.values(attrs).some((v: unknown) => {
          if (v && typeof v === "object" && "value" in v) {
            return String((v as any).value).toLowerCase().includes(q);
          }
          if (typeof v === "string") return v.toLowerCase().includes(q);
          return false;
        });
      });
    }

    return result;
  }, [items, categoryFilter, searchQuery]);

  // ── Delete (optimistic) ──

  const removeItem = useCallback(async (id: string) => {
    // Optimistic removal
    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      await api.deleteClothingItem(id);
    } catch (err) {
      // Revert on failure
      const msg = err instanceof AppError ? err.message : "Failed to remove item";
      Alert.alert("Error", msg);
      await refresh();
    }
  }, [refresh]);

  // ── Confirm-and-delete helper ──

  const confirmDelete = useCallback(
    (id: string) => {
      Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeItem(id),
        },
      ]);
    },
    [removeItem],
  );

  // ── Update item in local state after edit ──

  const updateItem = useCallback((id: string, detail: ClothingItemDetail) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, attributes: detail.attributes }
          : item,
      ),
    );
  }, []);

  return {
    items: filteredItems,
    allItems: items,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    refresh,
    removeItem,
    confirmDelete,
    updateItem,
  };
}
