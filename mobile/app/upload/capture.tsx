import { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import * as api from "../../lib/api";
import { useImagePicker } from "../../hooks/useImagePicker";
import { Button, LoadingOverlay, ErrorMessage } from "../../components/ui";
import { getUserFacingMessage, AppError } from "../../lib/errors";
import { colors, fontSize, fontWeight, spacing, borderRadius } from "../../lib/theme";

type ScreenState = "select" | "preview" | "analyzing" | "error";

export default function CaptureScreen() {
  const { image, processing, takePhoto, pickFromGallery, reset } = useImagePicker();
  const [state, setState] = useState<ScreenState>("select");
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!image) return;
    setState("analyzing");
    setError(null);

    try {
      const result = await api.analyzeClothing(image.uri);
      router.push({
        pathname: "/upload/review",
        params: {
          pipelineToken: result.pipeline_token,
          segmentedImageUrl: result.segmented_image_url,
          resultJson: JSON.stringify(result.result),
        },
      });
    } catch (err: unknown) {
      const msg = getUserFacingMessage(err);

      // Show specific message for validation failures
      if (err instanceof AppError && err.statusCode === 400) {
        setError(msg);
      } else {
        setError(msg);
      }
      setState("error");
    }
  }, [image]);

  const handleRetry = useCallback(() => {
    setState("preview");
    setError(null);
  }, []);

  const handleCancel = useCallback(() => {
    reset();
    setState("select");
    setError(null);
  }, [reset]);

  // Show error state
  if (state === "error") {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <ErrorMessage message={error || "Something went wrong."} />
          <View style={styles.errorActions}>
            <Button label="Try Again" onPress={handleRetry} />
            <Button label="Choose a Different Photo" onPress={handleCancel} variant="outline" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={state === "analyzing"} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="contain" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📸</Text>
            <Text style={styles.placeholderTitle}>Add a Clothing Item</Text>
            <Text style={styles.placeholderSubtitle}>
              Take a photo or choose one from your gallery.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        {image ? (
          <>
            <Button
              label="Analyze Clothing"
              onPress={handleAnalyze}
              disabled={processing}
              loading={processing}
            />
            <Button
              label="Choose a Different Photo"
              onPress={handleCancel}
              variant="outline"
            />
          </>
        ) : (
          <>
            <Button
              label="Take Photo"
              onPress={takePhoto}
              loading={processing}
              disabled={processing}
            />
            <Button
              label="Choose from Gallery"
              onPress={pickFromGallery}
              variant="outline"
              loading={processing}
              disabled={processing}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flex: 1,
    padding: spacing.lg,
  },
  preview: {
    flex: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  placeholder: {
    flex: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    padding: spacing.xxl,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  placeholderTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  placeholderSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: "center",
    color: colors.text,
  },
  errorActions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
