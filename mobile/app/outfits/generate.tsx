/**
 * Outfit Generation screen — the main orchestrator.
 *
 * Coordinates: Occasion/Style config → AI generation → result display.
 * Handles all state transitions: idle → configuring → generating → success | error.
 */

import { useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme";
import { useOutfitGeneration } from "@/hooks/useOutfitGeneration";
import {
  OutfitConfigSheet,
  GenerationLoading,
  GeneratedOutfitScreen,
  GenerationErrorView,
} from "@/components/outfits";

export default function OutfitGenerationScreen() {
  const { date: targetDate } = useLocalSearchParams<{ date?: string }>();
  const {
    state,
    result,
    error,
    loadingMessage,
    loadingProgress,
    openConfig,
    startGenerating,
    reset,
  } = useOutfitGeneration();

  // Open the configuration bottom sheet immediately when screen mounts
  useEffect(() => {
    openConfig();
  }, [openConfig]);

  const handleGenerate = useCallback(
    (params: {
      occasion: string;
      style: string;
      weather?: { temperature?: number; condition?: string };
    }) => {
      startGenerating(params);
    },
    [startGenerating],
  );

  const handleRegenerate = useCallback(() => {
    openConfig();
  }, [openConfig]);

  const handleClose = useCallback(() => {
    reset();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  }, [reset]);

  const handleRetry = useCallback(() => {
    openConfig();
  }, [openConfig]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Config Sheet — shown on mount and when user wants to reconfigure */}
      {state === "configuring" && (
        <OutfitConfigSheet
          visible={true}
          onClose={handleClose}
          onGenerate={handleGenerate}
        />
      )}

      {/* Loading — premium animated generation experience */}
      {state === "generating" && (
        <GenerationLoading
          message={loadingMessage}
          progress={loadingProgress}
        />
      )}

      {/* Success — show the generated outfit */}
      {state === "success" && result && (
        <GeneratedOutfitScreen
          result={result}
          targetDate={targetDate}
          onRegenerate={handleRegenerate}
          onClose={handleClose}
        />
      )}

      {/* Error — context-appropriate error with retry */}
      {state === "error" && error && (
        <GenerationErrorView
          error={error}
          onRetry={error.retry ? handleRetry : undefined}
          onBack={handleClose}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
