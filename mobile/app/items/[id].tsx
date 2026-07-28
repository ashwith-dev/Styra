import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Button,
  CachedImage,
  Chip,
  ErrorMessage,
  Input,
  LoadingOverlay,
  LoadingSkeletonCard,
} from "@/components/ui";
import { colors, radius, shadows, spacing, typography } from "@/theme";
import {
  EDITABLE_FIELDS,
  getAttrValue,
  getClothingLabel,
  getItemImageUrl,
  useItemDetail,
} from "@/features/wardrobe";

// ─────────────────────────────────────────────────────────────────────────────
// Detail Screen
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clothing Detail screen — also hosts inline Edit mode.
 *
 * States:
 *   loading   → full-screen skeleton
 *   error     → ErrorMessage + retry
 *   loaded    → image, attribute chips, Edit / Delete CTAs
 *   editing   → Input fields for each editable attribute
 *   saving    → editing view + LoadingOverlay
 *   deleting  → loaded view + LoadingOverlay
 */
export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    item,
    state,
    error,
    getFieldValue,
    setEditField,
    startEditing,
    cancelEditing,
    saveEdits,
    handleDelete,
    reload,
  } = useItemDetail(id);

  // ── Loading ──
  if (state === "loading") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <BackButton />
        <View style={styles.skeletonWrapper}>
          <LoadingSkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──
  if (state === "error" || !item) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <BackButton />
        <View style={styles.centered}>
          <ErrorMessage message={error ?? "Could not load item."} onRetry={reload} />
          <Button
            label="Back to Wardrobe"
            onPress={() => router.replace("/wardrobe")}
            variant="ghost"
            style={styles.backBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const attrs = item.attributes ?? {};
  const label = getClothingLabel(attrs);
  const imageUrl = getItemImageUrl(item);

  // ── Editing / Saving ──
  if (state === "editing" || state === "saving") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <LoadingOverlay visible={state === "saving"} />

        {/* Header */}
        <View style={styles.editHeader}>
          <BackButton onPress={cancelEditing} label="Cancel" />
          <Text style={styles.editTitle}>Edit Item</Text>
          <Button
            label="Save"
            onPress={saveEdits}
            loading={state === "saving"}
            disabled={state === "saving"}
            variant="primary"
            size="sm"
            style={styles.saveBtn}
            testID="edit-save"
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.editScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Thumbnail */}
          <CachedImage
            uri={imageUrl}
            style={styles.editImage}
            resizeMode="contain"
            accessibilityLabel={label}
          />

          {/* Fields */}
          <View style={styles.editFields}>
            {EDITABLE_FIELDS.map((field) => (
              <Input
                key={field.key}
                label={field.label}
                value={getFieldValue(field.key)}
                onChangeText={(v) => setEditField(field.key, v)}
                multiline={field.multiline}
                numberOfLines={field.multiline ? 3 : 1}
                returnKeyType={field.multiline ? "default" : "next"}
                testID={`edit-field-${field.key}`}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Loaded / Deleting ──
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <LoadingOverlay visible={state === "deleting"} />

      {/* Header */}
      <View style={styles.detailHeader}>
        <BackButton />
        <View style={styles.detailHeaderActions}>
          <TouchableOpacity
            onPress={startEditing}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Edit item"
            testID="detail-edit"
          >
            <Ionicons name="pencil-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Delete item"
            testID="detail-delete"
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.detailScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image */}
        <View style={styles.imageWrapper}>
          <CachedImage
            uri={imageUrl}
            style={styles.heroImage}
            resizeMode="contain"
            accessibilityLabel={`Photo of ${label}`}
          />
        </View>

        {/* Name + category */}
        <View style={styles.titleRow}>
          <Text style={styles.itemTitle}>{label || "Clothing Item"}</Text>
          {getAttrValue(attrs.category) ? (
            <Chip
              label={getAttrValue(attrs.category)}
              selected
              style={styles.categoryChip}
            />
          ) : null}
        </View>

        {/* Attribute rows */}
        <View style={styles.attrSection}>
          <AttributeRow label="Type" value={getAttrValue(attrs.type)} />
          <AttributeRow label="Color" value={getAttrValue(attrs.color)} />
          <AttributeRow label="Pattern" value={getAttrValue(attrs.pattern)} />
          <AttributeRow label="Material" value={getAttrValue(attrs.material)} />
          <AttributeRow label="Style" value={getAttrValue(attrs.style)} />
          <AttributeRow label="Fit" value={getAttrValue(attrs.fit)} />
          <AttributeRow label="Neckline" value={getAttrValue(attrs.neckline)} />
          <AttributeRow label="Sleeve Length" value={getAttrValue(attrs.sleeve_length)} />
          <AttributeRow label="Length" value={getAttrValue(attrs.length)} />
          <AttributeRow label="Closure" value={getAttrValue(attrs.closure)} />
          <AttributeRow label="Brand" value={getAttrValue(attrs.brand)} />
        </View>

        {/* Season + Occasion chips */}
        <MultiChipRow label="Season" attr={attrs.season} />
        <MultiChipRow label="Occasion" attr={attrs.occasion} />

        {/* Description */}
        {getAttrValue(attrs.description) ? (
          <View style={styles.descSection}>
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.descValue}>{getAttrValue(attrs.description)}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (file-local, not exported)
// ─────────────────────────────────────────────────────────────────────────────

function BackButton({
  onPress,
  label,
}: {
  onPress?: () => void;
  label?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress ?? (() => router.back())}
      style={styles.backButton}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={label ?? "Go back"}
      testID="detail-back"
    >
      <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      {label ? <Text style={styles.backLabel}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

function AttributeRow({ label, value }: { label: string; value: string }) {
  if (!value || value === "unknown") return null;
  return (
    <View style={styles.attrRow}>
      <Text style={styles.attrLabel}>{label}</Text>
      <Text style={styles.attrValue}>{value}</Text>
    </View>
  );
}

function MultiChipRow({ label, attr }: { label: string; attr: unknown }) {
  const items = Array.isArray(attr) ? attr : [];
  if (items.length === 0) return null;
  const values = items.map((i) =>
    typeof i === "object" && i !== null && "value" in i ? String(i.value) : String(i),
  );
  return (
    <View style={styles.chipRow}>
      <Text style={styles.chipRowLabel}>{label}</Text>
      <View style={styles.chipList}>
        {values.map((v) => (
          <Chip key={v} label={v} style={styles.chip} />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  backBtn: {
    marginTop: spacing.md,
  },
  skeletonWrapper: {
    padding: spacing.xl,
  },

  // ── Back button ──
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  backLabel: {
    ...typography.caption,
    color: colors.textPrimary,
  },

  // ── Detail header ──
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailHeaderActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Detail scroll ──
  detailScroll: {
    paddingBottom: spacing.massive,
  },
  imageWrapper: {
    backgroundColor: colors.surface,
    ...shadows.small,
  },
  heroImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.border,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  itemTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  categoryChip: {
    flexShrink: 0,
  },

  // ── Attribute rows ──
  attrSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  attrRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  attrLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  attrValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
    textTransform: "capitalize",
  },

  // ── Chip rows (Season / Occasion) ──
  chipRow: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  chipRowLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontSize: 11,
  },
  chipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {},

  // ── Description ──
  descSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  descLabel: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  descValue: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },

  // ── Edit mode ──
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  editTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
  },
  editScroll: {
    paddingBottom: spacing.massive,
  },
  editImage: {
    width: "100%",
    aspectRatio: 1.2,
    backgroundColor: colors.border,
    marginBottom: spacing.xl,
  },
  editFields: {
    paddingHorizontal: spacing.xl,
  },
});
