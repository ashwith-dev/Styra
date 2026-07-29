import { useRef, useState } from "react";
import type { TextInput } from "react-native";
import { useAuth } from "@/providers/AuthProvider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface State {
  email: string;
  password: string;
  emailError: string | null;
  passwordError: string | null;
  submitError: string | null;
  loading: boolean;
}

const INITIAL: State = {
  email: "",
  password: "",
  emailError: null,
  passwordError: null,
  submitError: null,
  loading: false,
};

/**
 * Encapsulates all state, validation, and submission logic for the Sign In form.
 * Keeps the screen component purely presentational.
 */
export function useSignInForm() {
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [state, setState] = useState<State>(INITIAL);

  /** Generic field setter — clears field-level and submit-level errors on change */
  const setField =
    (field: "email" | "password") =>
    (value: string): void => {
      setState((prev) => ({
        ...prev,
        [field]: value,
        [`${field}Error`]: null,
        submitError: null,
      }));
    };

  const validate = (): boolean => {
    const updates: Partial<State> = {};
    let ok = true;

    if (!state.email.trim()) {
      updates.emailError = "Email is required.";
      ok = false;
    } else if (!EMAIL_RE.test(state.email.trim())) {
      updates.emailError = "Enter a valid email address.";
      ok = false;
    }

    if (!state.password) {
      updates.passwordError = "Password is required.";
      ok = false;
    }

    if (!ok) setState((prev) => ({ ...prev, ...updates }));
    return ok;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;
    setState((prev) => ({ ...prev, loading: true, submitError: null }));

    try {
      const { error } = await signIn(state.email.trim(), state.password);
      setState((prev) => ({ ...prev, loading: false }));

      if (error) {
        const message = error.message.toLowerCase().includes("invalid login credentials")
          ? "Incorrect email or password. Please try again."
          : error.message;
        setState((prev) => ({ ...prev, submitError: message }));
      }
      // On success, session updates → RootNavigator handles redirect automatically
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network request failed. Please check your connection.";
      setState((prev) => ({ ...prev, loading: false, submitError: message }));
    }
  };

  return {
    ...state,
    setEmail: setField("email"),
    setPassword: setField("password"),
    passwordRef,
    handleSubmit,
  };
}
