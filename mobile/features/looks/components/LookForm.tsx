import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { colors, radius, spacing, typography } from "@/theme";
import type { ClothingItemBrief } from "@/lib/types";
import { LOOK_CATEGORIES, LOOK_SEASONS } from "../config";
import type { LookFormValues } from "../types/looks";

interface LookFormProps {
  initialValues: LookFormValues;
  values: LookFormValues;
  onChangeField: (field: keyof LookFormValues, value: any) => void;
  wardrobeItems: ClothingItemBrief[];
  onSubmit: () => void;
  onOpenItemSelector: () => void;
  submitLabel: string;
  submitting: boolean;
  error?: string | null;
  testID?: string;
}

export function LookForm({
  values,
  onChangeField,
  wardrobeItems,
  onSubmit,
  onOpenItemSelector,
  submitLabel,
  submitting,
  error,
  testID,
}: LookFormProps) {
  const selectedCount = values.selectedItemIds.length;

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={submitting} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error && <Text style={styles.errorBanner}>{error}</Text>}

        {/* Look Name Input */}
        <Input
          label="Look Name *"
          placeholder="e.g. Summer Friday Casual, Evening Gala..."
          value={values.name}
          onChangeText={(v) => onChangeField("name", v)}
          testID="look-name-input"
        />

        {/* Item Selector Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Clothing Items *</Text>
          <Text style={styles.sectionSubtitle}>
            Select items from your wardrobe to compose this look.
          </Text>
          <Button
            label={
              selectedCount === 0
                ? "+ Select Wardrobe Items"
                : `Edit Selection (${selectedCount} ${selectedCount === 1 ? "Item" : "Items"})`
            }
            onPress={onOpenItemSelector}
            variant={selectedCount === 0 ? "outline" : "ghost"}
            size="md"
            style={styles.selectBtn}
            testID="open-item-selector"
          />
        </View>

        {/* Category Chip Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.chipRow}>
            {LOOK_CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                selected={values.category === cat}
                onPress={() => onChangeField("category", cat)}
              />
            ))}
          </View>
        </View>

        {/* Season Chip Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Season</Text>
          <View style={styles.chipRow}>
            {LOOK_SEASONS.map((season) => (
              <Chip
                key={season}
                label={season}
                selected={values.season === season}
                onPress={() => onChangeField("season", season)}
              />
            ))}
          </View>
        </View>

        {/* Description Input */}
        <Input
          label="Notes / Description"
          placeholder="Add styling notes or occasion details..."
          value={values.description}
          onChangeText={(v) => onChangeField("description", v)}
          multiline
          numberOfLines={3}
          testID="look-description-input"
        />
      </ScrollView>

      {/* Submit Button Bar */}
      <View style={styles.bottomBar}>
        <Button
          label={submitLabel}
          onPress={onSubmit}
          loading={submitting}
          disabled={submitting}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.primaryBtn}
          testID={testID ?? "submit-look-form"}
        />
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
    padding: spacing.xl,
    paddingBottom: 100,
  },
  errorBanner: {
    ...typography.caption,
    color: colors.error,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  sectionSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  selectBtn: {
    alignSelf: "flex-start",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
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
