import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { clearAllLocalData } from "../lib/storage/clearAll";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  /** Sends a password-reset email via Supabase Auth */
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  // ── Initial session restore (persists across app restarts) ──
  useEffect(() => {
    mountedRef.current = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;
      setSession(session);
      setLoading(false);
    }).catch(() => {
      // A failed restore must not leave the app stuck on the splash spinner.
      if (mountedRef.current) setLoading(false);
    });
    return () => { mountedRef.current = false; };
  }, []);

  // ── Listen for auth changes (handles token refresh, sign-out from other tabs) ──
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
            username: name ? name.split(" ")[0] : email.split("@")[0],
            first_name: name ? name.split(" ")[0] : undefined,
          },
        },
      });
      return { user: data.user, error };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network request failed. Please check your connection.";
      return { user: null, error: new Error(message) as unknown as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { user: data.user, error };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network request failed. Please check your connection.";
      return { user: null, error: new Error(message) as unknown as AuthError };
    }
  };

  const signOut = async () => {
    const userId = session?.user?.id;
    try {
      await supabase.auth.signOut();
    } catch {
      // Non-fatal: session will be stale but sign-out is best-effort
    }
    // Wipe on-device caches so the next account on this device never sees
    // the previous user's wardrobe, looks, or preferences.
    await clearAllLocalData(userId);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network request failed. Please check your connection.";
      return { user: null, error: new Error(message) as unknown as AuthError };
    }
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
