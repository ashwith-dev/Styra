import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface EmptyWardrobeViewProps {
  onAddClothing: () => void;
}

const HERO_CLOSET_IMAGE = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop";

const CATEGORY_CHIPS = [
  "Tops (0)",
  "Bottoms (0)",
  "Shoes (0)",
  "Outerwear (0)",
  "Dresses (0)",
  "Accessories (0)",
];

export function EmptyWardrobeView({ onAddClothing }: EmptyWardrobeViewProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Top Hero Card ── */}
      <View style={styles.heroCard}>
        <Image
          source={{ uri: HERO_CLOSET_IMAGE }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <Text style={styles.heroTitle}>Your Wardrobe Awaits</Text>
        <Text style={styles.heroSubtitle}>
          Add your first clothing item to start building your AI wardrobe and unlock
          personalized outfit recommendations tailored to your unique style.
        </Text>

        <TouchableOpacity
          onPress={onAddClothing}
          style={styles.heroCtaBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add Your First Item"
        >
          <Text style={styles.heroCtaText}>Add Your First Item  +</Text>
        </TouchableOpacity>
      </View>

      {/* ── Categories Strip ── */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionLabel}>CATEGORIES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {CATEGORY_CHIPS.map((chip, idx) => (
            <View key={idx} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── All Clothes Section ── */}
      <View style={styles.allClothesSection}>
        <Text style={styles.sectionTitle}>All Clothes</Text>

        <View style={styles.emptyCard}>
          <View style={styles.hangerCircle}>
            <MaterialCommunityIcons name="hanger" size={32} color="#1A1A1A" />
          </View>

          <Text style={styles.emptyTitle}>No Clothes Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your uploaded clothing items will appear here once you add them to your
            digital vault.
          </Text>

          <TouchableOpacity
            onPress={onAddClothing}
            style={styles.uploadBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Upload Clothing"
          >
            <Text style={styles.uploadBtnText}>Upload Clothing</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Locked AI Outfit Generator Card ── */}
      <View style={styles.aiLockedCard}>
        <View style={styles.aiHeaderRow}>
          <Text style={styles.aiTitle}>AI Outfit Generator</Text>
          <Ionicons name="lock-closed" size={16} color="#7F7C76" />
        </View>
        <Text style={styles.aiSubtitle}>
          Add at least 2 Tops and 2 Bottoms to unlock outfit generation.
        </Text>
        <View style={styles.progressTrackContainer}>
          <View style={styles.progressLine} />
          <View style={styles.progressLine} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  heroImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  heroCtaBtn: {
    backgroundColor: "#1A1A1A",
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    width: "100%",
    alignItems: "center",
  },
  heroCtaText: {
    ...typography.button,
    color: colors.surface,
    fontSize: 15,
  },
  categoriesSection: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  chipsScroll: {
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: "#F4F1EA",
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  chipText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  allClothesSection: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xxl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  hangerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F4F1EA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  uploadBtn: {
    borderWidth: 1,
    borderColor: "#1A1A1A",
    borderRadius: radius.full,
    paddingVertical: 10,
    paddingHorizontal: spacing.xl,
  },
  uploadBtnText: {
    ...typography.button,
    fontSize: 14,
    color: "#1A1A1A",
  },
  aiLockedCard: {
    backgroundColor: "#FAF7F2",
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  aiHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  aiTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  aiSubtitle: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  progressTrackContainer: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  progressLine: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#EAE7DF",
  },
});
