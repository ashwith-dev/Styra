import { useCallback } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSkeletonCard } from "@/components/ui/LoadingSkeleton";
import { colors, radius, shadows, spacing, typography } from "@/theme";
import {
  SavedLookCard,
  useSavedLooks,
} from "@/features/looks";

export default function SavedLooksListScreen() {
  const { looks, saveState, error, actions } = useSavedLooks();

  useFocusEffect(
    useCallback(() => {
      void actions.refresh();
    }, [actions.refresh]),
  );

  const handleCreateLook = useCallback(() => {
    router.push("/looks/create");
  }, []);

  const handleLookPress = useCallback((id: string) => {
    router.push(`/looks/${id}`);
  }, []);

  const loading = saveState === "saving" && looks.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Saved Looks
          </Text>
        </View>

        <Badge
          label={`${looks.length} ${looks.length === 1 ? "Look" : "Looks"}`}
          variant="default"
          size="sm"
        />
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.skeletonWrapper}>
          <LoadingSkeletonCard />
        </View>
      ) : error && looks.length === 0 ? (
        <View style={styles.centered}>
          <ErrorMessage message={error} onRetry={actions.refresh} />
        </View>
      ) : looks.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            icon="👗"
            title="No Saved Looks Yet"
            description="Create your first look by combining clothing items from your wardrobe."
            actionLabel="Create First Look"
            onAction={handleCreateLook}
            testID="looks-empty-state"
          />
        </View>
      ) : (
        <FlatList
          data={looks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          windowSize={5}
          maxToRenderPerBatch={5}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={saveState === "saving"}
              onRefresh={actions.refresh}
              tintColor={colors.textSecondary}
            />
          }
          renderItem={({ item }) => (
            <SavedLookCard
              look={item}
              onPress={() => handleLookPress(item.id)}
            />
          )}
        />
      )}

      {/* Floating Action Button (FAB) to Create Look */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateLook}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Create look"
        testID="create-look-fab"
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.massive,
  },
  skeletonWrapper: {
    padding: spacing.xl,
  },
  centered: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyWrapper: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.large,
  },
  fabIcon: {
    ...typography.h2,
    color: colors.surface,
    lineHeight: 32,
    marginTop: -2,
  },
});
