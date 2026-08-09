import { useRef, useState } from "react";
import type { TextInput } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { saveOnboardingState } from "@/lib/storage/onboarding";

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
 * Existing users signing in bypass onboarding completely and go directly to /home.
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

  const handleSubmit = async (): Promise<boolean> => {
    if (!validate()) return false;
    setState((prev) => ({ ...prev, loading: true, submitError: null }));

    try {
      const { user, error } = await signIn(state.email.trim(), state.password);

      if (error) {
        const message = error.message.toLowerCase().includes("invalid login credentials")
          ? "Incorrect email or password. Please try again."
          : error.message;
        setState((prev) => ({ ...prev, loading: false, submitError: message }));
        return false;
      } else {
        setState((prev) => ({ ...prev, loading: false }));

        // Existing user signing in: Automatically mark onboarding as completed for this user
        if (user?.id) {
          await saveOnboardingState(user.id, {
            currentStep: 7,
            totalSteps: 7,
            completedSteps: [1, 2, 3, 4, 5, 6, 7],
            completed: true,
            selections: {
              preferredStyles: [],
              preferredColors: [],
            },
          });
        }

        return true;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network request failed. Please check your connection.";
      setState((prev) => ({ ...prev, loading: false, submitError: message }));
      return false;
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
