import { clearOnboardingState } from "@/lib/storage/onboarding";
import { clearPreferences } from "@/lib/storage/preferences";
import { clearSavedLooks } from "@/lib/storage/savedLooks";
import { clearWardrobeCache } from "@/lib/storage/wardrobeCache";
import { supabase } from "@/lib/supabase";

// Tables confirmed in database migrations. Each deletion is best-effort
// because the user may not have created records in every table.
const USER_SCOPED_TABLES = [
  "clothing_items",
  "outfit_feedback",
  "outfit_favorites",
] as const;

// Tables that may or may not exist depending on dashboard setup.
const OPTIONAL_TABLES = [
  "saved_looks",
  "user_preferences",
  "user_statistics",
  "notifications",
  "feedback",
] as const;

export async function deleteUserAccount(userId: string): Promise<boolean> {
  if (!userId) return false;

  // 1. Delete records from all known user-scoped database tables
  for (const table of USER_SCOPED_TABLES) {
    try {
      await supabase.from(table).delete().eq("user_id", userId);
    } catch {
      // Best-effort: table exists and user has records
    }
  }

  // 2. Delete from optional/legacy tables (may not exist)
  for (const table of OPTIONAL_TABLES) {
    try {
      await supabase.from(table).delete().eq("user_id", userId);
    } catch {
      // Table may not exist — this is expected
    }
  }

  // 3. Delete the profile row (public.profiles, created by DB trigger)
  try {
    await supabase.from("profiles").delete().eq("id", userId);
  } catch {
    // Profiles row may already be cascade-deleted via auth.users
  }

  // 4. Clear all local device storage & caches
  await clearPreferences().catch(() => {});
  await clearWardrobeCache().catch(() => {});
  await clearSavedLooks().catch(() => {});
  await clearOnboardingState(userId).catch(() => {});

  // 5. Sign out the user session
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore sign out error if session is already ended
  }

  return true;
}
