import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/providers/AuthProvider";
import { BottomNavBar, ErrorMessage } from "@/components/ui";
import { LoadingSkeletonCard } from "@/components/ui/LoadingSkeleton";
import { WardrobeScreenHeader } from "@/features/wardrobe";
import { colors, spacing, typography } from "@/theme";
import {
  EmptySavedLooksView,
  groupLooksByDate,
  SavedLook,
  SavedLookCard,
  SavedLooksFilterBar,
  SavedLooksHeaderSection,
  useSavedLooks,
} from "@/features/looks";

export default function SavedLooksListScreen() {
  const { looks, saveState, error, actions } = useSavedLooks();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");

  useFocusEffect(
    useCallback(() => {
      void actions.refresh();
    }, [actions.refresh]),
  );

  const handleWearAgain = useCallback((look: SavedLook) => {
    // Open outfit detail / apply saved outfit flow
    router.push(`/looks/${look.id}`);
  }, []);

  const handleEditOutfit = useCallback((look: SavedLook) => {
    // Navigate into existing outfit editing flow
    router.push(`/looks/edit?id=${look.id}`);
  }, []);

  // ── Real-time Search & Filter logic ──
  const filteredLooks = useMemo(() => {
    let result = looks;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((look) => {
        const nameMatch = look.name.toLowerCase().includes(q);
        const categoryMatch = look.category?.toLowerCase().includes(q);
        const tagMatch = look.tags?.some((t: string) => t.toLowerCase().includes(q));
        return nameMatch || categoryMatch || tagMatch;
      });
    }

    if (selectedFilter) {
      const filter = selectedFilter.toLowerCase();
      result = result.filter((look) => {
        const catMatch = look.category?.toLowerCase() === filter;
        const seasonMatch = look.season?.toLowerCase() === filter;
        const tagMatch = look.tags?.some((t: string) => t.toLowerCase() === filter);
        return catMatch || seasonMatch || tagMatch;
      });
    }

    return result;
  }, [looks, searchQuery, selectedFilter]);

  // ── Date Grouping ──
  const dateGroups = useMemo(() => {
    return groupLooksByDate(filteredLooks);
  }, [filteredLooks]);

  // Format display name for Avatar
  const rawName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.first_name;

  const userName = rawName
    ? String(rawName)
    : user?.email
    ? user.email.split("@")[0]
    : "Alex";

  const userAvatar = user?.user_metadata?.avatar_url ?? null;
  const loading = saveState === "saving" && looks.length === 0;

  // Header component inside FlatList so it scrolls with content in State 2
  const ListHeaderComponent = useMemo(
    () => (
      <View>
        <SavedLooksHeaderSection count={looks.length} />
      </View>
    ),
    [looks.length],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Top Navigation Bar: STYRA Logo + Avatar */}
        <WardrobeScreenHeader userAvatar={userAvatar} userName={userName} />

        {/* Content Area */}
        {loading ? (
          <View style={styles.skeletonWrapper}>
            <LoadingSkeletonCard />
          </View>
        ) : error && looks.length === 0 ? (
          <View style={styles.centered}>
            <ErrorMessage message={error} onRetry={actions.refresh} />
          </View>
        ) : looks.length === 0 ? (
          /* STATE 1: EMPTY SAVED LOOKS (IMAGE 1) - No Search/Filter, Header section scrolls inside EmptySavedLooksView */
          <EmptySavedLooksView />
        ) : (
          /* STATE 2: SAVED LOOKS AVAILABLE (IMAGE 2) - Search/Filter & Header section scroll inside FlatList */
          <FlatList
            data={dateGroups}
            keyExtractor={(group) => group.title}
            ListHeaderComponent={ListHeaderComponent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={saveState === "saving"}
                onRefresh={actions.refresh}
                tintColor={colors.textSecondary}
              />
            }
            renderItem={({ item: group }) => (
              <View style={styles.groupContainer}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                {group.data.map((look) => (
                  <SavedLookCard
                    key={look.id}
                    look={look}
                    onWearAgain={handleWearAgain}
                    onEdit={handleEditOutfit}
                  />
                ))}
              </View>
            )}
          />
        )}

        {/* Floating Bottom Navigation Bar */}
        <BottomNavBar activeTab="looks" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    position: "relative",
  },
  skeletonWrapper: {
    paddingHorizontal: spacing.xl,
  },
  centered: {
    padding: spacing.xl,
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 120,
  },
  groupContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  groupTitle: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
});
