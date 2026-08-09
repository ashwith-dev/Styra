import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { generateId } from "@/lib/uuid";
import { useWardrobe } from "@/hooks/useWardrobe";
import { colors, spacing, typography } from "@/theme";
import {
  ClothingSelectorModal,
  LOOK_CONFIG,
  LookForm,
  useSavedLooks,
} from "@/features/looks";
import type { LookFormValues } from "@/features/looks";

export default function EditLookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { saveState, error, actions } = useSavedLooks();
  const { allItems } = useWardrobe();

  const existingLook = id ? actions.getLookById(id) : null;

  const [modalVisible, setModalVisible] = useState(false);
  const [formValues, setFormValues] = useState<LookFormValues>({
    name: "",
    description: "",
    category: LOOK_CONFIG.defaultCategory,
    season: LOOK_CONFIG.defaultSeason,
    selectedItemIds: [],
  });

  useEffect(() => {
    if (existingLook) {
      setFormValues({
        name: existingLook.name,
        description: existingLook.description || "",
        category: existingLook.category || LOOK_CONFIG.defaultCategory,
        season: existingLook.season || LOOK_CONFIG.defaultSeason,
        selectedItemIds: existingLook.items.map((i) => i.clothing_item_id),
      });
    }
  }, [existingLook]);

  const handleChangeField = useCallback(
    (field: keyof LookFormValues, value: any) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleToggleItem = useCallback((itemId: string) => {
    setFormValues((prev) => {
      const set = new Set(prev.selectedItemIds);
      if (set.has(itemId)) {
        set.delete(itemId);
      } else {
        set.add(itemId);
      }
      return { ...prev, selectedItemIds: Array.from(set) };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!id || !existingLook || !formValues.name.trim()) return;

    const selectedMap = new Map(allItems.map((item) => [item.id, item]));
    const updatedItems = formValues.selectedItemIds.map((itemId) => {
      const existingItem = existingLook.items.find(
        (i) => i.clothing_item_id === itemId,
      );
      if (existingItem) return existingItem;

      const wardrobeItem = selectedMap.get(itemId);
      return {
        id: generateId(),
        clothing_item_id: itemId,
        thumbnail_url: wardrobeItem?.thumbnail_url || null,
        segmented_image_url: wardrobeItem?.segmented_image_url || null,
        attributes: wardrobeItem?.attributes || {},
      };
    });

    const updated = await actions.update(id, {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      category: formValues.category,
      season: formValues.season,
      items: updatedItems,
    });

    if (updated) {
      router.replace({
        pathname: "/looks/[id]",
        params: { id },
      });
    }
  }, [id, existingLook, formValues, allItems, actions]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Cancel editing"
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">
          Edit Look
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Shared Presentation Form Component */}
      <LookForm
        initialValues={formValues}
        values={formValues}
        onChangeField={handleChangeField}
        wardrobeItems={allItems}
        onSubmit={handleSubmit}
        onOpenItemSelector={() => setModalVisible(true)}
        submitLabel="Update Look"
        submitting={saveState === "saving"}
        error={error}
        testID="edit-look-submit"
      />

      {/* Stateless Item Selector Modal */}
      <ClothingSelectorModal
        visible={modalVisible}
        items={allItems}
        selectedIds={formValues.selectedItemIds}
        onToggleItem={handleToggleItem}
        onConfirm={() => setModalVisible(false)}
        onClose={() => setModalVisible(false)}
      />
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
});
