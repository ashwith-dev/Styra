import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface State {
  email: string;
  emailError: string | null;
  submitError: string | null;
  loading: boolean;
  submitted: boolean;
}

const INITIAL: State = {
  email: "",
  emailError: null,
  submitError: null,
  loading: false,
  submitted: false,
};

/**
 * Encapsulates state, validation, and submission for the Forgot Password form.
 * `submitted` flips to true after a successful request, enabling the
 * screen to render a success confirmation view.
 */
export function useForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [state, setState] = useState<State>(INITIAL);

  const setEmail = (value: string): void => {
    setState((prev) => ({
      ...prev,
      email: value,
      emailError: null,
      submitError: null,
    }));
  };

  const validate = (): boolean => {
    if (!state.email.trim()) {
      setState((prev) => ({ ...prev, emailError: "Email is required." }));
      return false;
    }
    if (!EMAIL_RE.test(state.email.trim())) {
      setState((prev) => ({
        ...prev,
        emailError: "Enter a valid email address.",
      }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;
    setState((prev) => ({ ...prev, loading: true, submitError: null }));

    try {
      const { error } = await resetPassword(state.email.trim());
      setState((prev) => ({ ...prev, loading: false }));

      if (error) {
        setState((prev) => ({ ...prev, submitError: error.message }));
      } else {
        setState((prev) => ({ ...prev, submitted: true }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network request failed. Please check your connection.";
      setState((prev) => ({ ...prev, loading: false, submitError: message }));
    }
  };

  return {
    ...state,
    setEmail,
    handleSubmit,
  };
}
