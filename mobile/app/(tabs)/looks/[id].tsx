import { useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { ClothingCard } from "@/components/wardrobe/ClothingCard";
import { colors, radius, spacing, typography } from "@/theme";
import { useSavedLooks } from "@/features/looks";

export default function LookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { saveState, error, actions } = useSavedLooks();

  const look = actions.getLookById(id);

  const handleEdit = useCallback(() => {
    if (!id) return;
    router.push({
      pathname: "/looks/edit",
      params: { id },
    });
  }, [id]);

  const handleDelete = useCallback(() => {
    if (!id || !look) return;
    Alert.alert(
      "Delete Look",
      `Are you sure you want to delete "${look.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await actions.delete(id);
            if (success) {
              router.replace("/looks");
            }
          },
        },
      ],
    );
  }, [id, look, actions]);

  const handleItemPress = useCallback((clothingId: string) => {
    router.push(`/items/${clothingId}`);
  }, []);

  if (!look && saveState !== "saving") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ErrorMessage message={error || "Look not found."} />
          <Button
            label="Back to Saved Looks"
            onPress={() => router.replace("/looks")}
            variant="ghost"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <LoadingOverlay visible={saveState === "deleting"} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Edit look"
            testID="look-edit-btn"
          >
            <Ionicons name="pencil-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Delete look"
            testID="look-delete-btn"
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Badges */}
        <View style={styles.titleSection}>
          <Text style={styles.lookName}>{look?.name}</Text>
          <View style={styles.badgeRow}>
            {look?.category && (
              <Badge label={look.category} variant="default" size="md" />
            )}
            {look?.season && (
              <Badge label={look.season} variant="default" size="md" />
            )}
            <Badge
              label={look?.source === "ai" ? "AI STYLIST" : "MANUAL"}
              variant={look?.source === "ai" ? "warning" : "default"}
              size="md"
            />
          </View>
        </View>

        {/* Description */}
        {look?.description ? (
          <View style={styles.descSection}>
            <Text style={styles.descText}>{look.description}</Text>
          </View>
        ) : null}

        {/* Items Section Header */}
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsTitle}>
            Outfit Items ({look?.items.length ?? 0})
          </Text>
        </View>

        {/* Grid of Look Items (Reuses ClothingCard) */}
        <View style={styles.gridContainer}>
          {look?.items.map((item) => {
            const clothingBrief = {
              id: item.clothing_item_id,
              original_image_url: "",
              segmented_image_url: item.segmented_image_url || "",
              thumbnail_url: item.thumbnail_url || null,
              attributes: item.attributes || {},
              status: "active",
              created_at: "",
            };

            return (
              <View key={item.id} style={styles.cardWrapper}>
                <ClothingCard
                  item={clothingBrief}
                  onPress={() => handleItemPress(item.clothing_item_id)}
                  onLongPress={() => {}}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  headerActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.massive,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  lookName: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  descSection: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  itemsHeader: {
    marginBottom: spacing.md,
  },
  itemsTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },
  cardWrapper: {
    width: "50%",
  },
});
