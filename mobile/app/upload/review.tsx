import { useCallback, useEffect, useMemo } from "react";
import {
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, CachedImage, ErrorMessage, LoadingOverlay } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/theme";
import type { AIPipelineResult } from "@/lib/types";
import { AttributeField } from "@/components/upload/AttributeField";
import { AttributeSelectField } from "@/components/upload/AttributeSelectField";
import { AttributeTags } from "@/components/upload/AttributeTags";
import {
  DEFAULT_OCCASIONS,
  DEFAULT_SEASONS,
  useUploadState,
} from "@/features/upload";
import {
  getActiveFieldsForCategory,
  getCategoriesForWardrobeType,
  getSubcategoriesForCategory,
} from "@/features/upload/taxonomy";
import { useProfileData } from "@/features/profile";

/**
 * ReviewScreen: Displays detected AI attributes, supports dynamic editing based on wardrobe type and category.
 */
export default function ReviewScreen() {
  const { preferences } = useProfileData();
  const wardrobeType = preferences.wardrobeType || "mixed";

  const params = useLocalSearchParams<{
    pipelineToken: string;
    segmentedImageUrl: string;
    resultJson: string;
  }>();

  const aiResult = useMemo<AIPipelineResult>(() => {
    if (!params.resultJson) return {} as AIPipelineResult;
    try {
      return JSON.parse(params.resultJson) as AIPipelineResult;
    } catch {
      return {} as AIPipelineResult;
    }
  }, [params.resultJson]);

  const {
    draft,
    getValue,
    setAttribute,
    errors,
    saving,
    saveError,
    saveDraft,
    resetDraft,
  } = useUploadState({
    pipelineToken: params.pipelineToken,
    segmentedImageUrl: params.segmentedImageUrl,
    aiResult,
  });

  const categoryValue = getValue("category") || "top";
  const subcategoryValue = getValue("type") || "";

  const activeFields = useMemo(
    () => getActiveFieldsForCategory(categoryValue, subcategoryValue),
    [categoryValue, subcategoryValue],
  );

  const categoryDefs = useMemo(
    () => getCategoriesForWardrobeType(wardrobeType),
    [wardrobeType],
  );
  const categoryOptions = useMemo(
    () => categoryDefs.map((c) => c.name),
    [categoryDefs],
  );
  // The backend and recommendation engine expect canonical category ids
  // ("top"), not display names ("Tops") — translate at the select boundary.
  const categoryDisplayValue = useMemo(() => {
    const found = categoryDefs.find(
      (c) => c.id === categoryValue.toLowerCase() || c.name.toLowerCase() === categoryValue.toLowerCase(),
    );
    return found ? found.name : categoryValue;
  }, [categoryDefs, categoryValue]);

  const subcategoryOptions = useMemo(
    () => getSubcategoriesForCategory(categoryValue, wardrobeType),
    [categoryValue, wardrobeType],
  );

  const navigation = useNavigation();

  // Prevent leaving screen while save API is in flight
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !saving,
      headerBackVisible: !saving,
    });
  }, [navigation, saving]);

  useEffect(() => {
    if (!saving) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [saving]);

  const handleSave = useCallback(async () => {
    const success = await saveDraft();
    if (success) {
      router.replace("/wardrobe");
    }
  }, [saveDraft]);

  const handleCancel = useCallback(() => {
    resetDraft();
    router.replace("/wardrobe");
  }, [resetDraft]);

  const getConfidence = useCallback(
    (key: string): number => {
      const val = (aiResult as any)[key];
      if (val && typeof val === "object" && "confidence" in val) return val.confidence;
      return 0;
    },
    [aiResult],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <LoadingOverlay visible={saving} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancel}
          disabled={saving}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Cancel upload"
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">
          Review & Edit
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Save to wardrobe"
          testID="save-header-btn"
        >
          <Text style={styles.saveHeaderLabel}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {saveError && (
          <View style={styles.errorWrapper}>
            <ErrorMessage message={saveError} />
          </View>
        )}

        {/* Segmented Hero Image */}
        <View style={styles.imageCard}>
          <CachedImage
            uri={params.segmentedImageUrl}
            style={styles.heroImage}
            resizeMode="contain"
            accessibilityLabel="Segmented clothing item"
          />
        </View>

        {/* Section: Single Attributes */}
        <Text style={styles.sectionTitle}>Clothing Information</Text>
        <Text style={styles.sectionSubtitle}>
          Review detected attributes and edit any field before saving.
        </Text>

        {activeFields.map((field) => {
          const val = getValue(field.key);
          const conf = getConfidence(field.key);

          if (field.key === "category") {
            return (
              <AttributeSelectField
                key={field.key}
                label={field.label}
                value={categoryDisplayValue}
                options={categoryOptions}
                confidence={conf}
                onSelect={(newCatName) => {
                  const id =
                    categoryDefs.find((c) => c.name === newCatName)?.id ?? newCatName;
                  setAttribute("category", id);
                  const newSubs = getSubcategoriesForCategory(id, wardrobeType);
                  if (newSubs.length > 0) {
                    setAttribute("type", newSubs[0]);
                  }
                }}
                error={errors[field.key]}
                testID={`field-${field.key}`}
              />
            );
          }

          if (field.key === "type") {
            return (
              <AttributeSelectField
                key={field.key}
                label={field.label}
                value={val}
                options={subcategoryOptions}
                confidence={conf}
                onSelect={(newType) => setAttribute("type", newType)}
                error={errors[field.key]}
                testID={`field-${field.key}`}
              />
            );
          }

          if (field.type === "text") {
            return (
              <AttributeField
                key={field.key}
                label={field.label}
                value={val}
                confidence={conf}
                onChangeText={(t) => setAttribute(field.key, t)}
                error={errors[field.key]}
                multiline={field.key === "description"}
                testID={`field-${field.key}`}
              />
            );
          }

          return (
            <AttributeSelectField
              key={field.key}
              label={field.label}
              value={val}
              options={field.options}
              type={field.type}
              confidence={conf}
              onSelect={(t) => setAttribute(field.key, t)}
              error={errors[field.key]}
              testID={`field-${field.key}`}
            />
          );
        })}

        {/* Section: Season & Occasion */}
        <Text style={styles.sectionTitle}>Season & Occasion</Text>
        <AttributeTags
          label="Season"
          items={draft.season}
          selectableOptions={DEFAULT_SEASONS}
        />
        <AttributeTags
          label="Occasion"
          items={draft.occasion}
          selectableOptions={DEFAULT_OCCASIONS}
        />

        {/* Model Metadata */}
        {aiResult.model_name && (
          <View style={styles.metadataBox}>
            <Text style={styles.metadataText}>
              Analyzed with {aiResult.model_name} ({aiResult.model_version})
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Save Action */}
      <View style={styles.bottomBar}>
        <Button
          label="Save to Wardrobe"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.primaryBtn}
          testID="save-bottom-btn"
        />
      </View>
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
  saveHeaderLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.accent,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  errorWrapper: {
    marginBottom: spacing.md,
  },
  imageCard: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: "hidden",
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  metadataBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metadataText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  primaryBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
  },
});
