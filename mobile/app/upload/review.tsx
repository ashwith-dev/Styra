import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as api from "../../lib/api";
import { getUserFacingMessage } from "../../lib/errors";
import type { AIPipelineResult } from "../../lib/types";
import { Button, LoadingOverlay, ErrorMessage } from "../../components/ui";
import { AttributeField } from "../../components/upload/AttributeField";
import { AttributeTags } from "../../components/upload/AttributeTags";
import { colors, fontSize, fontWeight, spacing, borderRadius } from "../../lib/theme";

// ── Editable field definitions ──

interface FieldDef {
  key: string;
  label: string;
  required?: boolean;
  validate?: (v: string) => string | null;
}

const SINGLE_ATTRS: FieldDef[] = [
  { key: "category", label: "Category", required: true,
    validate: (v) => !v.trim() ? "Category is required" : null },
  { key: "type", label: "Type", required: true,
    validate: (v) => !v.trim() ? "Type is required" : null },
  { key: "color", label: "Color", required: true,
    validate: (v) => !v.trim() ? "Color is required" : null },
  { key: "pattern", label: "Pattern" },
  { key: "material", label: "Material" },
  { key: "style", label: "Style" },
  { key: "neckline", label: "Neckline" },
  { key: "sleeve_length", label: "Sleeve Length" },
  { key: "fit", label: "Fit" },
  { key: "length", label: "Length" },
  { key: "closure", label: "Closure" },
  { key: "brand", label: "Brand" },
  { key: "description", label: "Description" },
];

// ── Screen ──

type ScreenState = "review" | "saving" | "error";

export default function ReviewScreen() {
  const params = useLocalSearchParams<{
    pipelineToken: string;
    segmentedImageUrl: string;
    resultJson: string;
  }>();

  const aiResult = useMemo<AIPipelineResult>(
    () => JSON.parse(params.resultJson),
    [params.resultJson],
  );

  const [edits, setEdits] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<ScreenState>("review");
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Derived values ──

  const getValue = useCallback(
    (key: string): string => {
      if (edits[key] !== undefined) return edits[key];
      const val = (aiResult as any)[key];
      if (val && typeof val === "object" && "value" in val) return String(val.value);
      if (typeof val === "string") return val;
      return "";
    },
    [edits, aiResult],
  );

  const getConfidence = useCallback(
    (key: string): number => {
      const val = (aiResult as any)[key];
      if (val && typeof val === "object" && "confidence" in val) return val.confidence;
      return 0;
    },
    [aiResult],
  );

  const setValue = useCallback((key: string, text: string) => {
    setEdits((prev) => ({ ...prev, [key]: text }));
    // Clear error when user types
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // ── Validation ──

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    for (const attr of SINGLE_ATTRS) {
      if (attr.validate) {
        const err = attr.validate(getValue(attr.key));
        if (err) newErrors[attr.key] = err;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [getValue]);

  // ── Save ──

  const buildPayload = useCallback((): Record<string, unknown> => {
    const payload: Record<string, unknown> = {};
    for (const attr of SINGLE_ATTRS) {
      const val = getValue(attr.key);
      if (val.trim()) {
        payload[attr.key] = { value: val.trim(), confidence: 1.0 };
      }
    }
    // Preserve multi-value attributes as-is
    if (aiResult.season) payload.season = aiResult.season;
    if (aiResult.occasion) payload.occasion = aiResult.occasion;
    return payload;
  }, [getValue, aiResult]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    setState("saving");
    setSaveError(null);

    try {
      const attrs = buildPayload();
      await api.saveClothing(params.pipelineToken, attrs);
      router.replace("/wardrobe");
    } catch (err: unknown) {
      setSaveError(getUserFacingMessage(err));
      setState("error");
    }
  }, [validate, buildPayload, params.pipelineToken]);

  const handleRetry = useCallback(() => {
    setState("saving");
    setSaveError(null);

    // Bypass the validate call on retry
    (async () => {
      try {
        const attrs = buildPayload();
        await api.saveClothing(params.pipelineToken, attrs);
        router.replace("/wardrobe");
      } catch (err: unknown) {
        setSaveError(getUserFacingMessage(err));
        setState("error");
      }
    })();
  }, [buildPayload, params.pipelineToken]);

  const handleBackToReview = useCallback(() => {
    setState("review");
    setSaveError(null);
  }, []);

  // ── Error screen ──

  if (state === "error") {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Save Failed</Text>
        <ErrorMessage message={saveError || "Something went wrong."} />
        <View style={styles.errorActions}>
          <Button label="Try Again" onPress={handleRetry} />
          <Button label="Go Back" onPress={handleBackToReview} variant="outline" />
        </View>
      </View>
    );
  }

  // ── Review screen ──

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={state === "saving"} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Segmented image */}
        <Image
          source={{ uri: params.segmentedImageUrl }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Section: detected attributes */}
        <Text style={styles.sectionTitle}>Detected Attributes</Text>
        <Text style={styles.sectionSubtitle}>
          Review and edit the attributes before saving.
        </Text>

        {SINGLE_ATTRS.map((attr) => (
          <AttributeField
            key={attr.key}
            label={attr.label}
            value={getValue(attr.key)}
            confidence={getConfidence(attr.key)}
            onChangeText={(t) => setValue(attr.key, t)}
            error={errors[attr.key]}
          />
        ))}

        {/* Multi-value attributes (read-only) */}
        <Text style={styles.sectionTitle}>Season & Occasion</Text>
        <AttributeTags
          label="Season"
          items={aiResult.season || []}
          emptyLabel="Not detected"
        />
        <AttributeTags
          label="Occasion"
          items={aiResult.occasion || []}
          emptyLabel="Not detected"
        />

        {/* Pipeline metadata */}
        <View style={styles.metadataBox}>
          <Text style={styles.metadataText}>
            Model: {aiResult.model_name}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom save bar */}
      <View style={styles.saveBar}>
        <Button
          label="Save to Wardrobe"
          onPress={handleSave}
          loading={state === "saving"}
          disabled={state === "saving"}
        />
      </View>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100, // room for save bar
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  metadataBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  metadataText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    textAlign: "center",
  },
  saveBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  // Error screen
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.background,
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
