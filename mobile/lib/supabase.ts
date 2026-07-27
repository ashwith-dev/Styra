import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

// SecureStore-based adapter for React Native (persists session across restarts).
// All operations are wrapped in try/catch so that keychain failures on
// unsupported devices or transient hardware errors don't crash the auth flow.
export const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Write failures are non-fatal: the session token will be missing
      // on next launch, forcing a fresh sign-in. No crash.
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Delete failures are non-fatal: stale tokens are harmless and
      // will be overwritten or ignored by the auth client.
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
