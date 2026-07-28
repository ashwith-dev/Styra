import { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as api from "@/lib/api";
import { getUserFacingMessage } from "@/lib/errors";
import { useImagePicker } from "@/hooks/useImagePicker";
import { Button, Card, ErrorMessage, LoadingOverlay } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/theme";

type ScreenState = "select" | "preview" | "analyzing" | "error";

/**
 * CaptureScreen: Single screen managing internal UI state transitions.
 *
 * Flow:
 *   No Image Selected (select)
 *   → Choose Camera / Gallery
 *   → Image Preview (preview)
 *   → Analyze Clothing (analyzing)
 *   → Navigate to Review (/upload/review)
 */
export default function CaptureScreen() {
  const { image, processing, takePhoto, pickFromGallery, reset } = useImagePicker();
  const [state, setState] = useState<ScreenState>("select");
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation();
  const analyzing = state === "analyzing";

  // Prevent backing out while analysis API is in flight
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !analyzing,
      headerBackVisible: !analyzing,
    });
  }, [navigation, analyzing]);

  useEffect(() => {
    if (!analyzing) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [analyzing]);

  // Sync state when image changes
  useEffect(() => {
    if (image && state === "select") {
      setState("preview");
    }
  }, [image, state]);

  const handleAnalyze = useCallback(async () => {
    if (!image) return;
    setState("analyzing");
    setError(null);

    try {
      const result = await api.analyzeClothing(image.uri);
      // Navigation is performed by the screen component
      router.push({
        pathname: "/upload/review",
        params: {
          pipelineToken: result.pipeline_token,
          segmentedImageUrl: result.segmented_image_url,
          resultJson: JSON.stringify(result.result),
        },
      });
    } catch (err: unknown) {
      setError(getUserFacingMessage(err));
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

  const handleClose = useCallback(() => {
    reset();
    router.back();
  }, [reset]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <LoadingOverlay visible={analyzing} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleClose}
          disabled={analyzing}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Close upload"
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">
          Add Clothing
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {state === "error" ? (
          <View style={styles.errorWrapper}>
            <Text style={styles.errorTitle}>Analysis Failed</Text>
            <ErrorMessage message={error || "Something went wrong."} />
            <View style={styles.errorActions}>
              <Button label="Try Again" onPress={handleRetry} variant="primary" fullWidth />
              <Button
                label="Choose a Different Photo"
                onPress={handleCancel}
                variant="outline"
                fullWidth
              />
            </View>
          </View>
        ) : image ? (
          <Card variant="flat" padding={0} style={styles.previewCard}>
            <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="contain" />
          </Card>
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="camera-outline" size={36} color={colors.textPrimary} />
            </View>
            <Text style={styles.placeholderTitle}>Add to Your Wardrobe</Text>
            <Text style={styles.placeholderSubtitle}>
              Take a clean photo or pick an existing image from your gallery.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Bar */}
      {state !== "error" && (
        <View style={styles.actions}>
          {image ? (
            <>
              <Button
                label="Analyze Clothing"
                onPress={handleAnalyze}
                disabled={processing || analyzing}
                loading={processing || analyzing}
                variant="primary"
                size="lg"
                fullWidth
                style={styles.primaryBtn}
                testID="analyze-btn"
              />
              <Button
                label="Choose a Different Photo"
                onPress={handleCancel}
                disabled={analyzing}
                variant="outline"
                size="lg"
                fullWidth
              />
            </>
          ) : (
            <>
              <Button
                label="Take Photo"
                onPress={takePhoto}
                loading={processing}
                disabled={processing}
                variant="primary"
                size="lg"
                fullWidth
                style={styles.primaryBtn}
                testID="take-photo-btn"
              />
              <Button
                label="Choose from Gallery"
                onPress={pickFromGallery}
                variant="outline"
                size="lg"
                fullWidth
                loading={processing}
                disabled={processing}
                testID="choose-gallery-btn"
              />
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: "center",
  },
  previewCard: {
    width: "100%",
    aspectRatio: 0.85,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  placeholderTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  placeholderSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
  },
  errorWrapper: {
    alignItems: "center",
    gap: spacing.md,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  errorActions: {
    alignSelf: "stretch",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
