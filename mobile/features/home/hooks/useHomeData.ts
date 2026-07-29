import { useMemo } from "react";
import { getCachedWardrobeCategoryCount, useWardrobe } from "@/hooks/useWardrobe";
import { useAuth } from "@/providers/AuthProvider";
import {
  validateMinimumWardrobe,
  type WardrobeValidationResult,
} from "@/features/wardrobe/utils/wardrobeValidation";

function getGreetingTime(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function extractFirstName(raw: string): string {
  if (!raw) return "Alex";

  // If raw contains spaces (e.g. "Ashwith Thatipally"), take first word
  const firstWord = raw.trim().split(" ")[0].split("@")[0];

  // If string contains concatenated name (e.g. "ashwiththatipally" -> "Ashwith")
  let cleanName = firstWord.replace(/[._0-9]/g, "");
  if (cleanName.toLowerCase().startsWith("ashwith")) {
    cleanName = "Ashwith";
  }

  if (!cleanName) return "Alex";
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
}

export interface HomeViewModel {
  user: {
    name: string;
    avatar: string | null;
    greetingTime: string;
    signOut: () => Promise<void>;
  };
  stats: {
    totalItems: number;
    categoryCount: number;
    topCategory: string | null;
  };
  wardrobeValidation: WardrobeValidationResult;
  recentItems: ReturnType<typeof useWardrobe>["allItems"];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  confirmDelete: (id: string) => void;
}

export function useHomeData(): HomeViewModel {
  const { user, signOut } = useAuth();
  const { allItems, loading, error, refresh, confirmDelete } = useWardrobe();

  const greetingTime = useMemo(() => getGreetingTime(), []);

  // Compute minimum wardrobe validation (at least 2 tops & 2 bottoms required for AI outfit generation)
  const wardrobeValidation = useMemo(() => {
    return validateMinimumWardrobe(allItems);
  }, [allItems]);

  // Recent 5 items sorted by creation date
  const recentItems = useMemo(() => {
    return [...allItems]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [allItems]);

  const totalItems = allItems.length;

  const categoryCount = useMemo(() => {
    return getCachedWardrobeCategoryCount();
  }, [allItems]);

  const topCategory = useMemo(() => {
    if (allItems.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const item of allItems) {
      const cat = (item.attributes as Record<string, unknown>)?.category;
      const catVal =
        typeof cat === "object" && cat !== null && "value" in cat
          ? String((cat as { value: unknown }).value)
          : typeof cat === "string"
          ? cat
          : null;

      if (catVal) {
        counts[catVal] = (counts[catVal] || 0) + 1;
      }
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  }, [allItems]);

  const rawName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.first_name ||
    user?.user_metadata?.display_name;

  const userName = extractFirstName(String(rawName || user?.email || "Ashwith"));
  const userAvatar = user?.user_metadata?.avatar_url ?? null;

  return {
    user: {
      name: userName,
      avatar: userAvatar,
      greetingTime,
      signOut,
    },
    stats: {
      totalItems,
      categoryCount,
      topCategory,
    },
    wardrobeValidation,
    recentItems,
    loading,
    error,
    refresh,
    confirmDelete,
  };
}
