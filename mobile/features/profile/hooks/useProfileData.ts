import { useCallback, useEffect, useMemo, useState } from "react";
import { getUserFacingMessage } from "@/lib/errors";
import { getSavedLooks } from "@/lib/storage/savedLooks";
import * as profileRepo from "@/repositories/profileRepository";
import {
  getCachedWardrobeCategoryCount,
  getCachedWardrobeCount,
  getCachedWardrobeItems,
} from "@/hooks/useWardrobe";
import { useAuth } from "@/providers/AuthProvider";
import { DEFAULT_PREFERENCES } from "../config";
import type {
  PreferenceState,
  ProfileUser,
  ProfileViewModel,
  UserPreferences,
} from "../types/profile";

export function useProfileData(): ProfileViewModel {
  const { user, signOut } = useAuth();

  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [preferenceState, setPreferenceState] =
    useState<PreferenceState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [savedLooksCount, setSavedLooksCount] = useState(0);

  // Load preferences and stats on mount
  useEffect(() => {
    let mounted = true;
    void (async () => {
      setPreferenceState("loading");
      try {
        const loadedPrefs = await profileRepo.fetchUserPreferences();
        const looks = await getSavedLooks();
        if (mounted) {
          setPreferences(loadedPrefs);
          setSavedLooksCount(looks.length);
          setPreferenceState("idle");
        }
      } catch {
        if (mounted) setPreferenceState("idle");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Update profile information (Name, Avatar URL)
  const updateProfile = useCallback(
    async (data: { name?: string; avatarUrl?: string }): Promise<boolean> => {
      setError(null);
      try {
        const success = await profileRepo.updateUserProfile(data);
        return success;
      } catch (err: unknown) {
        setError(getUserFacingMessage(err));
        return false;
      }
    },
    [],
  );

  // Update preferences independently and persist to storage
  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>): Promise<boolean> => {
      setPreferenceState("saving");
      setError(null);
      try {
        const updated = await profileRepo.updateUserPreferences(updates);
        setPreferences(updated);
        setPreferenceState("success");
        return true;
      } catch (err: unknown) {
        setError(getUserFacingMessage(err));
        setPreferenceState("error");
        return false;
      }
    },
    [],
  );

  const profileUser: ProfileUser = useMemo(() => {
    const rawName =
      user?.user_metadata?.full_name ??
      user?.user_metadata?.name ??
      user?.user_metadata?.first_name ??
      (user?.email ? user.email.split("@")[0] : "User");

    const formattedName =
      typeof rawName === "string" && rawName.trim().length > 0
        ? rawName.trim()
        : "User";

    return {
      id: user?.id ?? "",
      name: formattedName,
      email: user?.email ?? "No email provided",
      avatarUrl: user?.user_metadata?.avatar_url ?? null,
      createdAt: user?.created_at ?? new Date().toISOString(),
    };
  }, [user]);

  const totalItems = getCachedWardrobeCount();
  const categoryCount = getCachedWardrobeCategoryCount();
  const outfitsCreatedCount = savedLooksCount;

  // Real calculations for wardrobe insights. Computed every render (cheap
  // over a few hundred items) — memoizing on an unrelated dependency
  // served stale insights after wardrobe changes.
  const wardrobeItems = getCachedWardrobeItems();

  let insights = {
    mostWorn: "None Yet",
    favColour: "None Yet",
    mostOwned: "None Yet",
    newestItem: "No items",
  };

  if (wardrobeItems.length > 0) {
    const categoryCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};

    for (const item of wardrobeItems) {
      const attrs = (item.attributes || {}) as Record<string, any>;
      const cat = attrs.category?.value || attrs.category;
      const col = attrs.color?.value || attrs.color;

      if (cat) {
        const catStr = String(cat);
        categoryCounts[catStr] = (categoryCounts[catStr] || 0) + 1;
      }
      if (col) {
        const colStr = String(col);
        colorCounts[colStr] = (colorCounts[colStr] || 0) + 1;
      }
    }

    const mostOwned =
      Object.keys(categoryCounts).reduce(
        (a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b),
        "",
      ) || "None Yet";

    const favColor =
      Object.keys(colorCounts).reduce(
        (a, b) => (colorCounts[a] > colorCounts[b] ? a : b),
        "",
      ) || "None Yet";

    let newestText = "No items";
    const sorted = [...wardrobeItems].sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime(),
    );

    if (sorted[0]?.created_at) {
      const d = new Date(sorted[0].created_at);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - d.getTime()) / (1000 * 3600 * 24),
      );

      if (diffDays === 0) newestText = "Today";
      else if (diffDays === 1) newestText = "Yesterday";
      else newestText = `${diffDays} days ago`;
    }

    insights = {
      mostWorn: mostOwned,
      favColour: favColor,
      mostOwned,
      newestItem: newestText,
    };
  }

  return {
    user: profileUser,
    preferences,
    stats: {
      totalItems,
      categoryCount,
      savedLooksCount,
      outfitsCreatedCount,
    },
    insights,
    preferenceState,
    error,
    actions: {
      updateProfile,
      updatePreferences,
      signOut,
    },
  };
}
