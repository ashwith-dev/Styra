import type { UserPreferences } from "@/features/profile/types/profile";
import { isOnline } from "@/lib/network/networkStatus";

import * as prefStorage from "@/lib/storage/preferences";
import { enqueueOp } from "@/lib/sync/mutationQueue";
import { registerSyncHandler } from "@/lib/sync/syncEngine";
import { supabase } from "@/lib/supabase";

const PROFILE_PRIORITY = 1;
const PREFERENCES_PRIORITY = 3;

// Sync handler for Background Mutation Queue
registerSyncHandler("UPDATE_PROFILE", async (op) => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: op.payload.metadata as Record<string, unknown>,
    });
    return !error;
  } catch {
    return false;
  }
});

registerSyncHandler("UPDATE_PREFERENCES", async (op) => {
  try {
    const updates = op.payload.updates as Partial<UserPreferences>;
    await syncPreferencesToSupabase(updates);
    await prefStorage.updatePreferences(updates);
    return true;
  } catch {
    return false;
  }
});

/**
 * Helper to push preferences & body profile changes directly to Supabase tables
 */
async function syncPreferencesToSupabase(updates: Partial<UserPreferences>): Promise<void> {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user || !user.id) return;
  const userId = user.id;

  // 1. Sync preferences to public.user_preferences table using explicitly onConflict: 'user_id'
  const prefPayload: Record<string, unknown> = {};
  if (updates.styles !== undefined) prefPayload.preferred_styles = updates.styles;
  if (updates.favoriteColors !== undefined) prefPayload.favourite_colors = updates.favoriteColors;
  if (updates.fitPreference !== undefined) prefPayload.fit_preference = updates.fitPreference;
  if (updates.lifestyle !== undefined) prefPayload.lifestyle = updates.lifestyle;
  if (updates.smartNotifications !== undefined) prefPayload.notifications_enabled = updates.smartNotifications;
  if (updates.temperatureUnit !== undefined) prefPayload.temperature_unit = updates.temperatureUnit;

  if (Object.keys(prefPayload).length > 0) {
    const { error: prefErr } = await supabase.from("user_preferences").upsert(
      {
        user_id: userId,
        ...prefPayload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (prefErr) {
      console.warn("Supabase user_preferences upsert error:", prefErr);
    }
  }

  // 2. Sync favorite_color to public.user_statistics table
  if (updates.favoriteColors && updates.favoriteColors.length > 0) {
    await supabase.from("user_statistics").upsert(
      {
        user_id: userId,
        favorite_color: updates.favoriteColors[0],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  }

  // 3. Sync body profile metrics to public.users table using onConflict: 'id'
  if (updates.bodyProfile) {
    const userBodyPayload: Record<string, unknown> = {};
    const bp = updates.bodyProfile;

    if (bp.height !== undefined && bp.height !== null) {
      const parsedH = parseInt(String(bp.height).replace(/[^0-9]/g, ""), 10);
      if (!isNaN(parsedH)) userBodyPayload.height_cm = parsedH;
    }
    if (bp.weight !== undefined && bp.weight !== null) {
      const parsedW = parseFloat(String(bp.weight).replace(/[^0-9.]/g, ""));
      if (!isNaN(parsedW)) userBodyPayload.weight_kg = parsedW;
    }
    if (bp.topSize !== undefined) {
      userBodyPayload.top_size = Array.isArray(bp.topSize) ? bp.topSize.join(", ") : bp.topSize;
    }
    if (bp.bottomSize !== undefined) {
      userBodyPayload.bottom_size = Array.isArray(bp.bottomSize) ? bp.bottomSize.join(", ") : bp.bottomSize;
    }
    if (bp.shoeSize !== undefined) {
      userBodyPayload.shoe_size = Array.isArray(bp.shoeSize) ? bp.shoeSize.join(", ") : bp.shoeSize;
    }
    if (bp.gender !== undefined) {
      userBodyPayload.gender = bp.gender;
    }

    if (Object.keys(userBodyPayload).length > 0) {
      const userEmail = user.email ?? "";
      const username =
        user.user_metadata?.username ??
        user.user_metadata?.full_name ??
        userEmail.split("@")[0];

      const { error: userErr } = await supabase.from("users").upsert(
        {
          id: userId,
          email: userEmail,
          username: username,
          ...userBodyPayload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
      if (userErr) {
        console.warn("Supabase users upsert error:", userErr);
      }
    }
  }
}

export async function fetchUserPreferences(): Promise<UserPreferences> {
  const localPrefs = await prefStorage.getPreferences();

  if (!isOnline()) {
    return localPrefs;
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return localPrefs;

    // Fetch from user_preferences table
    const { data: prefRow } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Fetch from users table for body profile
    const { data: userRow } = await supabase
      .from("users")
      .select("height_cm, weight_kg, top_size, bottom_size, shoe_size, gender")
      .eq("id", userId)
      .maybeSingle();

    if (!prefRow && !userRow) return localPrefs;

    const parseSize = (val: string | null | undefined): string | string[] => {
      if (!val) return "";
      if (val.includes(",")) {
        return val.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return val;
    };

    const mergedPrefs: UserPreferences = {
      ...localPrefs,
      styles: prefRow?.preferred_styles ?? localPrefs.styles,
      favoriteColors: prefRow?.favourite_colors ?? localPrefs.favoriteColors,
      fitPreference: prefRow?.fit_preference ?? localPrefs.fitPreference,
      lifestyle: prefRow?.lifestyle ?? localPrefs.lifestyle,
      smartNotifications: prefRow?.notifications_enabled ?? localPrefs.smartNotifications,
      temperatureUnit: prefRow?.temperature_unit ?? localPrefs.temperatureUnit,
      bodyProfile: {
        ...localPrefs.bodyProfile,
        height: userRow?.height_cm ? `${userRow.height_cm} cm` : localPrefs.bodyProfile.height,
        weight: userRow?.weight_kg ? `${userRow.weight_kg} kg` : localPrefs.bodyProfile.weight,
        topSize: parseSize(userRow?.top_size) || localPrefs.bodyProfile.topSize,
        bottomSize: parseSize(userRow?.bottom_size) || localPrefs.bodyProfile.bottomSize,
        shoeSize: parseSize(userRow?.shoe_size) || localPrefs.bodyProfile.shoeSize,
        gender: userRow?.gender ?? localPrefs.bodyProfile.gender,
      },
    };

    await prefStorage.updatePreferences(mergedPrefs);
    return mergedPrefs;
  } catch (err) {
    console.warn("Failed to fetch preferences from Supabase, returning local copy:", err);
    return localPrefs;
  }
}

export async function updateUserPreferences(
  updates: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const updatedLocal = await prefStorage.updatePreferences(updates);

  if (!isOnline()) {
    await enqueueOp("UPDATE_PREFERENCES", PREFERENCES_PRIORITY, { updates });
    return updatedLocal;
  }

  try {
    await syncPreferencesToSupabase(updates);
  } catch (err) {
    console.warn("Error syncing preferences to Supabase, queuing for later sync:", err);
    await enqueueOp("UPDATE_PREFERENCES", PREFERENCES_PRIORITY, { updates });
  }

  return updatedLocal;
}

export async function updateUserProfile(data: {
  name?: string;
  avatarUrl?: string;
}): Promise<boolean> {
  const metadata: Record<string, unknown> = {};
  if (data.name !== undefined) metadata.full_name = data.name.trim();
  if (data.avatarUrl !== undefined) metadata.avatar_url = data.avatarUrl.trim();

  if (!isOnline()) {
    await enqueueOp("UPDATE_PROFILE", PROFILE_PRIORITY, { metadata });
    return true;
  }

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  const userId = user?.id;

  const { error } = await supabase.auth.updateUser({ data: metadata });
  if (error) throw error;

  if (userId && data.name) {
    try {
      await supabase
        .from("users")
        .upsert(
          {
            id: userId,
            email: user.email ?? "",
            username: data.name.trim(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
    } catch {
      // Ignore background table error if username uniqueness constraint fails
    }
  }

  return true;
}
