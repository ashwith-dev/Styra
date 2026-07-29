export interface LifestyleOption {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
}

export interface StyleOption {
  id: string;
  title: string;
  imageUrl: string;
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  borderColor?: string;
}

export interface ColorShadeCategory {
  category: string;
  shades: ColorOption[];
}

export interface FitOption {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface OnboardingSelections {
  lifestyle?: string;
  preferredStyles: string[];
  preferredColors: string[];
  otherColor?: boolean;
  preferredFit?: string;
}

export interface OnboardingState {
  currentStep: number; // 1-indexed (1 to 7)
  totalSteps: number;
  completedSteps: number[];
  completed: boolean;
  selections: OnboardingSelections;
}

export interface OnboardingViewModel {
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  selections: OnboardingSelections;
  loading: boolean;
  canProceed: boolean;
  actions: {
    nextStep: () => Promise<void>;
    prevStep: () => void;
    skipOnboarding: () => Promise<void>;
    addFirstItemAndComplete: () => Promise<void>;
    selectLifestyle: (id: string) => void;
    toggleStyle: (id: string) => void;
    toggleColor: (colorName: string) => void;
    toggleOtherColor: () => void;
    selectFit: (id: string) => void;
    resetOnboarding: () => Promise<void>;
  };
}
