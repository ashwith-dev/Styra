import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Step1Welcome,
  Step2Lifestyle,
  Step3Styles,
  Step4Colors,
  Step5Fit,
  Step6Notifications,
  Step7Ready,
  useOnboarding,
} from "@/features/onboarding";

export default function OnboardingScreen() {
  const { currentStep, selections, loading, actions } = useOnboarding();

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A1A1A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {currentStep === 1 && (
        <Step1Welcome onGetStarted={actions.nextStep} />
      )}

      {currentStep === 2 && (
        <Step2Lifestyle
          selectedId={selections.lifestyle}
          onSelect={actions.selectLifestyle}
          onContinue={actions.nextStep}
          onBack={actions.prevStep}
          onSkip={actions.skipOnboarding}
        />
      )}

      {currentStep === 3 && (
        <Step3Styles
          selectedIds={selections.preferredStyles}
          onToggle={actions.toggleStyle}
          onContinue={actions.nextStep}
          onBack={actions.prevStep}
          onSkip={actions.skipOnboarding}
        />
      )}

      {currentStep === 4 && (
        <Step4Colors
          selectedColors={selections.preferredColors}
          otherColor={selections.otherColor}
          onToggleColor={actions.toggleColor}
          onToggleOtherColor={actions.toggleOtherColor}
          onContinue={actions.nextStep}
          onBack={actions.prevStep}
          onSkip={actions.skipOnboarding}
        />
      )}

      {currentStep === 5 && (
        <Step5Fit
          selectedId={selections.preferredFit}
          onSelect={actions.selectFit}
          onContinue={actions.nextStep}
          onBack={actions.prevStep}
          onSkip={actions.skipOnboarding}
        />
      )}

      {currentStep === 6 && (
        <Step6Notifications
          onAllow={actions.nextStep}
          onMaybeLater={actions.nextStep}
          onBack={actions.prevStep}
          onSkip={actions.skipOnboarding}
        />
      )}

      {currentStep === 7 && (
        <Step7Ready
          onAddFirstItem={actions.addFirstItemAndComplete}
          onGoToHome={actions.nextStep}
          onBack={actions.prevStep}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FAF8F5",
    alignItems: "center",
    justifyContent: "center",
  },
});
