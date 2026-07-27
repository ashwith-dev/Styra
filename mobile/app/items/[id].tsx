import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as api from "../../lib/api";
import { buildAttributeUpdatePayload } from "../../lib/attributes";
import { getUserFacingMessage } from "../../lib/errors";
import type { ClothingItemDetail } from "../../lib/types";
import { Button, ErrorMessage, CachedImage } from "../../components/ui";
import { colors, fontSize, fontWeight, spacing, borderRadius } from "../../lib/theme";

type ScreenState = "loading" | "loaded" | "error" | "editing" | "saving";

// ── Editable fields ──

interface EditField {
  key: string;
  label: string;
}

const EDITABLE_FIELDS: EditField[] = [
  { key: "category", label: "Category" },
  { key: "type", label: "Type" },
  { key: "color", label: "Color" },
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

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<ClothingItemDetail | null>(null);
  const [state, setState] = useState<ScreenState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  // ── Load ──

  const loadItem = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const data = await api.getClothingItem(id);
      if (!mountedRef.current) return;
      setItem(data);
      setState("loaded");
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getUserFacingMessage(err));
      setState("error");
    }
  }, [id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  // ── Edit helpers ──

  const getFieldValue = useCallback(
    (key: string): string => {
      if (edits[key] !== undefined) return edits[key];
      const attrs = item?.attributes || {};
      const val = (attrs as any)[key];
      if (val && typeof val === "object" && "value" in val) return String(val.value);
      if (typeof val === "string") return val;
      return "";
    },
    [edits, item],
  );

  const startEditing = useCallback(() => {
    setEdits({}); // reset edits to original values
    setState("editing");
  }, []);

  const cancelEditing = useCallback(() => {
    setEdits({});
    setState("loaded");
  }, []);

  const saveEdits = useCallback(async () => {
    setState("saving");
    try {
      const attrs = buildAttributeUpdatePayload(item?.attributes ?? {}, edits);
      const updated = await api.updateClothingItem(id, attrs);
      setItem(updated);
      setEdits({});
      setState("loaded");
    } catch (err) {
      Alert.alert("Save Failed", getUserFacingMessage(err));
      setState("editing");
    }
  }, [item, edits, id]);

  // ── Delete ──

  const handleDelete = useCallback(() => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteClothingItem(id);
            router.replace("/wardrobe");
          } catch (err) {
            Alert.alert("Error", getUserFacingMessage(err));
          }
        },
      },
    ]);
  }, [id]);

  // ── Loading ──

  if (state === "loading") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ── Error ──

  if (state === "error" || !item) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message={error || "Could not load item."} onRetry={loadItem} />
        <Button label="Back to Wardrobe" onPress={() => router.replace("/wardrobe")} variant="outline" />
      </View>
    );
  }

  // ── Editing ──

  if (state === "editing" || state === "saving") {
    return (
      <View style={styles.container}>
        {state === "saving" && (
          <View style={styles.savingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <CachedImage
            uri={item.segmented_image_url}
            style={styles.image}
            resizeMode="contain"
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Edit Attributes</Text>
            <Text style={styles.sectionSubtitle}>Modify any field below.</Text>

            {EDITABLE_FIELDS.map((field) => (
              <View key={field.key} style={styles.editFieldContainer}>
                <Text style={styles.editFieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.editInput}
                  value={getFieldValue(field.key)}
                  onChangeText={(t) =>
                    setEdits((prev) => ({ ...prev, [field.key]: t }))
                  }
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Edit actions */}
        <View style={styles.bottomBar}>
          <Button
            label="Cancel"
            onPress={cancelEditing}
            variant="outline"
            disabled={state === "saving"}
          />
          <Button
            label="Save Changes"
            onPress={saveEdits}
            loading={state === "saving"}
            disabled={state === "saving"}
          />
        </View>
      </View>
    );
  }

  // ── Loaded (view mode) ──

  const attrs = item.attributes || {};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CachedImage
          uri={item.segmented_image_url}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          {renderAttr("Category", attrs["category"])}
          {renderAttr("Type", attrs["type"])}
          {renderAttr("Color", attrs["color"])}
          {renderAttr("Pattern", attrs["pattern"])}
          {renderAttr("Material", attrs["material"])}
          {renderAttr("Style", attrs["style"])}
          {renderAttr("Neckline", attrs["neckline"])}
          {renderAttr("Sleeve Length", attrs["sleeve_length"])}
          {renderAttr("Fit", attrs["fit"])}
          {renderAttr("Length", attrs["length"])}
          {renderAttr("Closure", attrs["closure"])}
          {renderAttr("Brand", attrs["brand"])}
          {renderAttr("Description", attrs["description"])}
        </View>

        {(attrs["season"] != null || attrs["occasion"] != null) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Season & Occasion</Text>
            {renderMulti("Season", attrs["season"])}
            {renderMulti("Occasion", attrs["occasion"])}
          </View>
        )}

        {item.pipeline_metrics && (
          <View style={styles.metadataBox}>
            <Text style={styles.metadataText}>
              Pipeline: {Object.keys(item.pipeline_metrics).length} stages
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <Button label="Edit Attributes" onPress={startEditing} variant="outline" />
        <Button label="Delete Item" onPress={handleDelete} />
      </View>
    </View>
  );
}

// ── Helpers ──

function renderAttr(label: string, attr: unknown) {
  if (attr == null) return null;

  const value =
    typeof attr === "object" && attr !== null && "value" in attr
      ? (attr as any).value
      : attr;
  const confidence =
    typeof attr === "object" && attr !== null && "confidence" in attr
      ? (attr as any).confidence
      : null;

  if (!value || value === "unknown") return null;

  return (
    <View style={styles.attrRow} key={label}>
      <Text style={styles.attrLabel}>{label}</Text>
      <Text style={styles.attrValue}>
        {String(value)}
        {confidence != null && (
          <Text style={styles.confidence}>  ({Math.round(confidence * 100)}%)</Text>
        )}
      </Text>
    </View>
  );
}

function renderMulti(label: string, attr: unknown) {
  const items = (attr as any[]) || [];
  if (items.length === 0) return null;

  const labels = items.map((i) => i?.value ?? String(i)).join(", ");
  return (
    <View style={styles.attrRow} key={label}>
      <Text style={styles.attrLabel}>{label}</Text>
      <Text style={styles.attrValue}>{labels}</Text>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surface,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  },
  attrRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  attrLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  attrValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    flex: 2,
    textAlign: "right",
  },
  confidence: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  metadataBox: {
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  metadataText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  bottomBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.md,
  },
  // Edit mode
  editFieldContainer: {
    marginBottom: spacing.md,
  },
  editFieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  editInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.background,
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
