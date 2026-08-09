import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import type { ClothingItemBrief, ClothingItemDetail } from "../lib/types";
import { AppError } from "../lib/errors";
import * as wardrobeRepo from "../repositories/wardrobeRepository";
import * as wardrobeCache from "../lib/storage/wardrobeCache";
import { isOnline } from "../lib/network/networkStatus";
import * as api from "../lib/api";

let _cachedWardrobeItems: ClothingItemBrief[] = [];

/** Clear the in-memory wardrobe cache (sign-out / account switch). */
export function resetWardrobeMemoryCache(): void {
  _cachedWardrobeItems = [];
}

export function getCachedWardrobeItems(): ClothingItemBrief[] {
  return _cachedWardrobeItems;
}

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
  const [items, setItems] = useState<ClothingItemBrief[]>(() => _cachedWardrobeItems);
  const [loading, setLoading] = useState<boolean>(() => _cachedWardrobeItems.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Load cached items instantly on mount ──
  useEffect(() => {
    let mounted = true;
    void (async () => {
      const cachedMeta = await wardrobeCache.getCachedWardrobe();
      if (mounted) {
        if (cachedMeta?.data) {
          _cachedWardrobeItems = cachedMeta.data;
          setItems(cachedMeta.data);
        }
        // Immediately turn off full-screen skeleton if cache checked
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Refresh / Stale-While-Revalidate Background Sync ──
  const refresh = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Only show full skeleton if we have zero items in memory
    if (_cachedWardrobeItems.length === 0) {
      setLoading(true);
    }
    setError(null);

    if (!isOnline()) {
      setLoading(false);
      return;
    }

    try {
      const remoteItems = await api.listClothing(controller.signal);
      _cachedWardrobeItems = remoteItems;
      setItems(remoteItems);
      void wardrobeCache.setCachedWardrobe(remoteItems);
    } catch (err) {
      if ((err as Error)?.name === "CanceledError" || (err as Error)?.name === "AbortError") {
        return;
      }
      // If we already have items displayed, do not show fatal error
      if (_cachedWardrobeItems.length === 0) {
        const msg = err instanceof AppError ? err.message : "Failed to load wardrobe";
        setError(msg);
      }
    } finally {
      // Only the latest request may clear the loading flag — an aborted
      // predecessor must not hide its successor's loading state.
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
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
    setItems((prev) => prev.filter((i) => i.id !== id));
    _cachedWardrobeItems = _cachedWardrobeItems.filter((i) => i.id !== id);

    try {
      await wardrobeRepo.removeClothingItem(id);
    } catch (err) {
      const msg = err instanceof AppError ? err.message : "Failed to remove item";
      Alert.alert("Error", msg);
      await refresh();
    }
  }, [refresh]);

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
