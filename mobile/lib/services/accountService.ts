import * as api from "@/lib/api";
import { clearAllLocalData } from "@/lib/storage/clearAll";
import { supabase } from "@/lib/supabase";

/**
 * Permanently delete the user's account.
 *
 * Server-side deletion (auth user, DB rows via FK cascade, storage objects)
 * happens in the backend — only the service role can delete an auth user.
 * Throws when the backend call fails so the UI can surface an error instead
 * of silently pretending the account is gone.
 */
export async function deleteUserAccount(userId: string): Promise<boolean> {
  if (!userId) return false;

  await api.deleteAccount();

  await clearAllLocalData(userId);

  try {
    await supabase.auth.signOut();
  } catch {
    // Session may already be invalidated by the server-side delete.
  }

  return true;
}
