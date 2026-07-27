import { useEffect, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { useWardrobe } from "../../hooks/useWardrobe";
import { useRecommendations } from "../../hooks/useRecommendations";
import { Button } from "../../components/ui";
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from "../../lib/theme";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { allItems, refresh: refreshWardrobe } = useWardrobe();
  const { recommendations, refresh: refreshRecs } = useRecommendations();

  useEffect(() => {
    refreshWardrobe();
    refreshRecs();
  }, []);

  const totalItems = allItems.length;

  const categoryCount = useMemo(() => {
    const cats = new Set<string>();
    for (const item of allItems) {
      const cat = (
        item.attributes as Record<string, unknown>
      )?.category as { value?: unknown } | undefined;
      if (cat?.value) cats.add(String(cat.value));
    }
    return cats.size;
  }, [allItems]);

  const totalRecommendations = recommendations.length;

  const displayName =
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "User";
  const displayEmail = user?.email ?? "";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Avatar + Name + Email */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitial}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{displayEmail}</Text>
      </View>

      {/* Wardrobe Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wardrobe</Text>
        <View style={styles.statsRow}>
          <StatCard label="Items" value={String(totalItems)} />
          <StatCard label="Categories" value={String(categoryCount)} />
          <StatCard label="Outfits" value={String(totalRecommendations)} />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          label="Settings"
          onPress={() => router.push("/settings")}
          variant="outline"
        />
        <Button label="Sign Out" onPress={signOut} variant="primary" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.sm,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
