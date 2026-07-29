export {
  TOTAL_ONBOARDING_STEPS,
  LIFESTYLE_OPTIONS,
  STYLE_OPTIONS,
  MAIN_COLOR_OPTIONS,
  PREDEFINED_SHADES_CATEGORIES,
  FIT_OPTIONS,
} from "./config";

export type {
  LifestyleOption,
  StyleOption,
  ColorOption,
  ColorShadeCategory,
  FitOption,
  OnboardingSelections,
  OnboardingState,
  OnboardingViewModel,
} from "./types/onboarding";

export { useOnboarding } from "./hooks/useOnboarding";
export { ProgressDots } from "./components/ProgressDots";
export { OnboardingHeader } from "./components/OnboardingHeader";
export { OnboardingFooter } from "./components/OnboardingFooter";
export { Step1Welcome } from "./components/Step1Welcome";
export { Step2Lifestyle } from "./components/Step2Lifestyle";
export { Step3Styles } from "./components/Step3Styles";
export { Step4Colors } from "./components/Step4Colors";
export { MoreColoursModal } from "./components/MoreColoursModal";
export { Step5Fit } from "./components/Step5Fit";
export { Step6Notifications } from "./components/Step6Notifications";
export { Step7Ready } from "./components/Step7Ready";
