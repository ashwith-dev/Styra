import { clearOnboardingState } from "@/lib/storage/onboarding";
import { clearPreferences } from "@/lib/storage/preferences";
import { clearSavedLooks } from "@/lib/storage/savedLooks";
import { clearWardrobeCache } from "@/lib/storage/wardrobeCache";
import { supabase } from "@/lib/supabase";

export async function deleteUserAccount(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    // 1. Call RPC function to delete user from auth.users and public schema tables
    const { error: rpcErr } = await supabase.rpc("delete_user_account");
    if (rpcErr) {
      console.warn("Supabase delete_user_account RPC notice:", rpcErr);
      // Fallback manual table deletion
      await supabase.from("clothing_items").delete().eq("user_id", userId);
      await supabase.from("saved_looks").delete().eq("user_id", userId);
      await supabase.from("outfit_history").delete().eq("user_id", userId);
      await supabase.from("user_preferences").delete().eq("user_id", userId);
      await supabase.from("user_statistics").delete().eq("user_id", userId);
      await supabase.from("notifications").delete().eq("user_id", userId);
      await supabase.from("feedback").delete().eq("user_id", userId);
      await supabase.from("users").delete().eq("id", userId);
    }
  } catch (err) {
    console.warn("Supabase database account deletion warning:", err);
  }

  // 2. Clear all local device storage & caches
  try {
    await clearPreferences();
    await clearWardrobeCache();
    await clearSavedLooks();
    await clearOnboardingState(userId);
  } catch (err) {
    console.warn("Local storage cleanup warning:", err);
  }

  // 3. Sign out user session
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore sign out error if session is already ended
  }

  return true;
}
