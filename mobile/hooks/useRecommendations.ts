import { useCallback, useRef, useState } from "react";
import { Image } from "react-native";
import type { OutfitRecommendationItem } from "../lib/types";
import * as api from "../lib/api";
import { AppError } from "../lib/errors";

// Module-level cache so the detail screen can read recommendations without
// refetching or passing large objects through router params.
let _cachedRecommendations: OutfitRecommendationItem[] = [];

// Session-level disliked outfit IDs — prevents showing them again.
const _dislikedOutfitIds = new Set<string>();

export function cacheRecommendations(recs: OutfitRecommendationItem[]) {
  _cachedRecommendations = recs;
}

export function getCachedRecommendation(
  index: number,
): OutfitRecommendationItem | undefined {
  return _cachedRecommendations[index];
}

export function getCachedRecommendations(): OutfitRecommendationItem[] {
  return _cachedRecommendations;
}

export function addDislikedOutfit(outfitId: string) {
  _dislikedOutfitIds.add(outfitId);
}

export function isOutfitDisliked(outfitId: string): boolean {
  return _dislikedOutfitIds.has(outfitId);
}

export type Occasion =
  | "casual"
  | "formal"
  | "office"
  | "college"
  | "party"
  | "date_night"
  | "travel"
  | "gym"
  | "ethnic";

export const OCCASIONS: { label: string; value: Occasion }[] = [
  { label: "All", value: "" as Occasion },
  { label: "Casual", value: "casual" },
  { label: "Formal", value: "formal" },
  { label: "Office", value: "office" },
  { label: "College", value: "college" },
  { label: "Party", value: "party" },
  { label: "Date Night", value: "date_night" },
  { label: "Travel", value: "travel" },
  { label: "Gym", value: "gym" },
  { label: "Ethnic", value: "ethnic" },
];

export type Season = "spring" | "summer" | "fall" | "winter";

export const SEASONS: { label: string; value: Season | "" }[] = [
  { label: "All", value: "" },
  { label: "Spring", value: "spring" },
  { label: "Summer", value: "summer" },
  { label: "Fall", value: "fall" },
  { label: "Winter", value: "winter" },
];

// Track already-prefetched URLs to avoid redundant network requests when
// the recommendations screen re-fetches on every focus (e.g. tab switches).
const _prefetchedUrls = new Set<string>();

/**
 * Prefetch a list of image URIs in the background so they render from cache
 * when the Image component mounts.
 */
export function prefetchImages(urls: (string | null | undefined)[]): void {
  for (const url of urls) {
    if (url && !_prefetchedUrls.has(url)) {
      _prefetchedUrls.add(url);
      Image.prefetch(url);
    }
  }
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<OutfitRecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<Occasion | "">("");
  const [season, setSeason] = useState<Season | "">("");

  // Prevent duplicate concurrent refresh calls (e.g. pull-to-refresh while
  // a useFocusEffect fetch is still in-flight).
  const fetchingRef = useRef(false);

  // Cache the latest successful response in memory so the UI can immediately
  // show it before the next fetch finishes.
  const cache = useRef<OutfitRecommendationItem[]>([]);

  const refresh = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const params: { occasion?: string; season?: string } = {};
      if (occasion) params.occasion = occasion;
      if (season) params.season = season;

      const data = await api.getOutfitRecommendations(params);
      const filtered = data.recommendations.filter(
        (r) => !_dislikedOutfitIds.has(r.outfit_id),
      );
      setRecommendations(filtered);
      cache.current = filtered;
      cacheRecommendations(filtered);

      // Prefetch all outfit thumbnail images so they render instantly.
      const urls = filtered.flatMap((r) =>
        r.outfit_items.map((i) => i.thumbnail_url),
      );
      prefetchImages(urls);
    } catch (err) {
      const msg = err instanceof AppError ? err.message : "Failed to load recommendations";
      setError(msg);
      if (cache.current.length > 0) {
        setRecommendations(cache.current);
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [occasion, season]);

  return {
    recommendations,
    loading,
    error,
    occasion,
    setOccasion: useCallback((val: string) => setOccasion(val as Occasion | ""), []),
    season,
    setSeason: useCallback((val: string) => setSeason(val as Season | ""), []),
    refresh,
  };
}
