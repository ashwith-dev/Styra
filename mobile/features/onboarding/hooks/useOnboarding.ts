import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import {
  clearOnboardingState,
  getOnboardingState,
  saveOnboardingState,
} from "@/lib/storage/onboarding";
import { updateUserPreferences } from "@/repositories/profileRepository";
import { resolveColorHex } from "@/features/profile/utils/preferenceUtils";
import { TOTAL_ONBOARDING_STEPS } from "../config";
import type {
  OnboardingSelections,
  OnboardingState,
  OnboardingViewModel,
} from "../types/onboarding";

const INITIAL_SELECTIONS: OnboardingSelections = {
  lifestyle: undefined,
  preferredStyles: [],
  preferredColors: [],
  preferredFit: undefined,
  wardrobeType: undefined,
};

const DEFAULT_STATE: OnboardingState = {
  currentStep: 1,
  totalSteps: TOTAL_ONBOARDING_STEPS,
  completedSteps: [],
  completed: false,
  selections: INITIAL_SELECTIONS,
};

export function useOnboarding(): OnboardingViewModel {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";

  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  // Restore onboarding state from storage on mount
  useEffect(() => {
    let mounted = true;
    void (async () => {
      setLoading(true);
      const saved = await getOnboardingState(userId);
      if (mounted) {
        if (saved) {
          setState(saved);
        } else {
          setState(DEFAULT_STATE);
        }
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const syncOnboardingToPreferences = useCallback(async (selections: OnboardingSelections) => {
    try {
      const resolvedColors = (selections.preferredColors || []).map((c) => resolveColorHex(c));
      const genderMap: Record<string, string> = {
        men: "Male",
        women: "Female",
        mixed: "Others",
      };

      await updateUserPreferences({
        lifestyle: selections.lifestyle ? String(selections.lifestyle) : undefined,
        styles: selections.preferredStyles || [],
        favoriteColors: resolvedColors,
        fitPreference: selections.preferredFit ? String(selections.preferredFit) : undefined,
        wardrobeType: selections.wardrobeType,
        ...(selections.wardrobeType
          ? {
              bodyProfile: {
                height: "",
                weight: "",
                topSize: "",
                bottomSize: "",
                shoeSize: "",
                gender: genderMap[selections.wardrobeType] || "Others",
              },
            }
          : {}),
      });
    } catch {
      // Non-fatal if sync fails during onboarding
    }
  }, []);

  const updateAndPersist = useCallback(
    async (updater: (prev: OnboardingState) => OnboardingState) => {
      setState((prev) => {
        const next = updater(prev);
        void saveOnboardingState(userId, next);
        void syncOnboardingToPreferences(next.selections);
        return next;
      });
    },
    [userId, syncOnboardingToPreferences],
  );

  const selectLifestyle = useCallback(
    (id: string) => {
      void updateAndPersist((prev) => ({
        ...prev,
        selections: {
          ...prev.selections,
          lifestyle: id,
        },
      }));
    },
    [updateAndPersist],
  );

  const toggleStyle = useCallback(
    (id: string) => {
      void updateAndPersist((prev) => {
        const current = prev.selections.preferredStyles;
        const exists = current.includes(id);
        let nextStyles: string[];
        if (exists) {
          nextStyles = current.filter((s) => s !== id);
        } else {
          if (current.length >= 3) return prev;
          nextStyles = [...current, id];
        }
        return {
          ...prev,
          selections: {
            ...prev.selections,
            preferredStyles: nextStyles,
          },
        };
      });
    },
    [updateAndPersist],
  );

  const toggleColor = useCallback(
    (colorName: string) => {
      void updateAndPersist((prev) => {
        const current = prev.selections.preferredColors;
        const exists = current.includes(colorName);
        const nextColors = exists
          ? current.filter((c) => c !== colorName)
          : [...current, colorName];
        return {
          ...prev,
          selections: {
            ...prev.selections,
            preferredColors: nextColors,
          },
        };
      });
    },
    [updateAndPersist],
  );

  const toggleOtherColor = useCallback(() => {
    void updateAndPersist((prev) => ({
      ...prev,
      selections: {
        ...prev.selections,
        otherColor: !prev.selections.otherColor,
      },
    }));
  }, [updateAndPersist]);

  const selectFit = useCallback(
    (id: string) => {
      void updateAndPersist((prev) => ({
        ...prev,
        selections: {
          ...prev.selections,
          preferredFit: id,
        },
      }));
    },
    [updateAndPersist],
  );

  const selectWardrobeType = useCallback(
    (type: "men" | "women" | "mixed") => {
      void updateAndPersist((prev) => ({
        ...prev,
        selections: {
          ...prev.selections,
          wardrobeType: type,
        },
      }));
    },
    [updateAndPersist],
  );

  const canProceed = useMemo(() => {
    switch (state.currentStep) {
      case 1:
        return true;
      case 2:
        return Boolean(state.selections.lifestyle);
      case 3:
        return state.selections.preferredStyles.length > 0;
      case 4:
        return (
          state.selections.preferredColors.length > 0 ||
          Boolean(state.selections.otherColor)
        );
      case 5:
        return Boolean(state.selections.preferredFit);
      case 6:
        return true;
      case 7:
        return Boolean(state.selections.wardrobeType);
      case 8:
        return true;
      default:
        return true;
    }
  }, [state.currentStep, state.selections]);

  const nextStep = useCallback(async () => {
    if (state.currentStep < 8) {
      void updateAndPersist((prev) => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        completedSteps: Array.from(
          new Set([...prev.completedSteps, prev.currentStep]),
        ),
      }));
    } else {
      await syncOnboardingToPreferences(state.selections);
      await updateAndPersist((prev) => ({
        ...prev,
        completed: true,
        completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
      }));
      router.replace("/home");
    }
  }, [state.currentStep, state.selections, updateAndPersist, syncOnboardingToPreferences]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      void updateAndPersist((prev) => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  }, [state.currentStep, updateAndPersist]);

  const skipOnboarding = useCallback(async () => {
    if (state.currentStep < 8) {
      void updateAndPersist((prev) => ({
        ...prev,
        currentStep: prev.currentStep + 1,
      }));
    }
  }, [state.currentStep, updateAndPersist]);

  const addFirstItemAndComplete = useCallback(async () => {
    await syncOnboardingToPreferences(state.selections);
    await updateAndPersist((prev) => ({
      ...prev,
      completed: true,
      completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
    }));
    router.push("/upload/capture");
  }, [state.selections, updateAndPersist, syncOnboardingToPreferences]);

  const resetOnboarding = useCallback(async () => {
    await clearOnboardingState(userId);
    setState(DEFAULT_STATE);
  }, [userId]);

  return {
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    completed: state.completed,
    selections: state.selections,
    loading,
    canProceed,
    actions: {
      nextStep,
      prevStep,
      skipOnboarding,
      addFirstItemAndComplete,
      selectLifestyle,
      toggleStyle,
      toggleColor,
      toggleOtherColor,
      selectFit,
      selectWardrobeType,
      resetOnboarding,
    },
  };
}
