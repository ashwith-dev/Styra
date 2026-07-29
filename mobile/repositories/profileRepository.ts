import type { UserPreferences } from "@/features/profile/types/profile";
import { isOnline } from "@/lib/network/networkStatus";
import * as prefStorage from "@/lib/storage/preferences";
import { enqueueOp } from "@/lib/sync/mutationQueue";
import { registerSyncHandler } from "@/lib/sync/syncEngine";
import { supabase } from "@/lib/supabase";

// Priority 1 for Profile, Priority 3 for Preferences
const PROFILE_PRIORITY = 1;
const PREFERENCES_PRIORITY = 3;

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
    await prefStorage.updatePreferences(
      op.payload.updates as Partial<UserPreferences>,
    );
    return true;
  } catch {
    return false;
  }
});

export async function fetchUserPreferences(): Promise<UserPreferences> {
  return prefStorage.getPreferences();
}

export async function updateUserPreferences(
  updates: Partial<UserPreferences>,
): Promise<UserPreferences> {
  if (!isOnline()) {
    await enqueueOp("UPDATE_PREFERENCES", PREFERENCES_PRIORITY, { updates });
  }
  return prefStorage.updatePreferences(updates);
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

  const { error } = await supabase.auth.updateUser({ data: metadata });
  if (error) throw error;
  return true;
}
