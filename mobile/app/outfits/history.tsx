/**
 * Outfit history — generated and worn outfits.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius, typography } from "@/theme";
import { getOutfitHistory, getWornOutfits } from "@/lib/api";
import type { OutfitHistoryResponse } from "@/lib/api";

type HistoryItem = OutfitHistoryResponse["outfits"][number];

export default function OutfitHistoryScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"generated" | "worn">("generated");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  // Monotonic request id — stale responses (e.g. a slower previous tab's
  // fetch resolving after a tab switch) are discarded.
  const requestSeq = useRef(0);

  const fetchData = useCallback(
    async (targetTab: "generated" | "worn", targetPage: number, append: boolean) => {
      const seq = ++requestSeq.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const data =
          targetTab === "generated"
            ? await getOutfitHistory(targetPage, 20)
            : await getWornOutfits(targetPage, 20);
        if (seq !== requestSeq.current) return;
        setItems((prev) => (append ? [...prev, ...data.outfits] : data.outfits));
        setTotal(data.total);
      } catch {
        if (seq !== requestSeq.current) return;
        if (!append) setItems([]);
      } finally {
        if (seq === requestSeq.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    void fetchData(tab, 1, false);
  }, [tab, fetchData]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || items.length >= total) return;
    const nextPage = page + 1;
    setPage(nextPage);
    void fetchData(tab, nextPage, true);
  }, [loading, loadingMore, items.length, total, page, tab, fetchData]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Outfit History</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "generated" && styles.tabActive]}
          onPress={() => setTab("generated")}
        >
          <Text style={[styles.tabText, tab === "generated" && styles.tabTextActive]}>
            Generated
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "worn" && styles.tabActive]}
          onPress={() => setTab("worn")}
        >
          <Text style={[styles.tabText, tab === "worn" && styles.tabTextActive]}>
            Worn
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      ) : (
        <FlatList
          data={items}
          // The same outfit can appear on multiple worn dates, so the id
          // alone is not unique — suffix the row index.
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.textSecondary} style={styles.footerSpinner} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="shirt-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No outfits yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardOccasion}>{item.occasion || "Outfit"}</Text>
                {item.overall_score != null && (
                  <Text style={styles.cardScore}>{item.overall_score.toFixed(0)}</Text>
                )}
              </View>
              <Text style={styles.cardDate}>
                {new Date(item.created_at).toLocaleDateString()} · {item.items.length} items
                {item.gemini_used ? " · Gemini" : ""}
                {item.fallback_used ? " · Fallback" : ""}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  backBtn: { width: 40, alignItems: "center" },
  title: { ...typography.h3, color: colors.textPrimary },
  tabs: {
    flexDirection: "row", paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.md,
  },
  tab: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  tabText: { ...typography.caption, color: colors.textSecondary },
  tabTextActive: { color: colors.surface },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  footerSpinner: { marginVertical: spacing.md },
  empty: { alignItems: "center", marginTop: spacing.huge },
  emptyText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  cardOccasion: { ...typography.body, color: colors.textPrimary },
  cardScore: { ...typography.h3, color: colors.textPrimary },
  cardDate: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xxs },
});
