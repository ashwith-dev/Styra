import { useRef, useState } from "react";
import type { TextInput } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface State {
  name: string;
  email: string;
  password: string;
  nameError: string | null;
  emailError: string | null;
  passwordError: string | null;
  submitError: string | null;
  loading: boolean;
}

const INITIAL: State = {
  name: "",
  email: "",
  password: "",
  nameError: null,
  emailError: null,
  passwordError: null,
  submitError: null,
  loading: false,
};

/**
 * Encapsulates all state, validation, and submission logic for the Sign Up form.
 * On success, navigates to email verification screen.
 */
export function useSignUpForm() {
  const { signUp, signIn } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [state, setState] = useState<State>(INITIAL);

  const setField =
    (field: "name" | "email" | "password") =>
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

    if (!state.name.trim()) {
      updates.nameError = "Your name is required.";
      ok = false;
    }

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
    } else if (state.password.length < 8) {
      updates.passwordError = "Password must be at least 8 characters.";
      ok = false;
    }

    if (!ok) setState((prev) => ({ ...prev, ...updates }));
    return ok;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;
    setState((prev) => ({ ...prev, loading: true, submitError: null }));

    try {
      const email = state.email.trim();
      const password = state.password;

      const { error } = await signUp(email, password);

      if (error) {
        setState((prev) => ({ ...prev, loading: false, submitError: error.message }));
      } else {
        // Attempt immediate auto-login so user bypasses email verification screen
        const { error: signInErr } = await signIn(email, password);
        setState((prev) => ({ ...prev, loading: false }));

        if (signInErr) {
          router.replace("/onboarding");
        } else {
          router.replace("/onboarding");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network request failed. Please check your connection.";
      setState((prev) => ({ ...prev, loading: false, submitError: message }));
    }
  };

  return {
    ...state,
    setName: setField("name"),
    setEmail: setField("email"),
    setPassword: setField("password"),
    emailRef,
    passwordRef,
    handleSubmit,
  };
}
