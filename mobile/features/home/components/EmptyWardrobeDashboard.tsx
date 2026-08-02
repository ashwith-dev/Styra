import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
import { STEP1_IMAGES } from "@/features/onboarding/config";

interface EmptyWardrobeDashboardProps {
  userName?: string | null;
  onAddClothing: () => void;
}

const SUPPORTED_CATEGORIES = [
  { id: "tops", label: "Tops", icon: "shirt-outline" },
  { id: "bottoms", label: "Bottoms", icon: "pants-outline" },
  { id: "shoes", label: "Shoes", icon: "footsteps-outline" },
  { id: "dresses", label: "Dresses", icon: "woman-outline" },
  { id: "outerwear", label: "Outerwear", icon: "coat-outline" },
  { id: "accessories", label: "Accessories", icon: "glasses-outline" },
];

const EDUCATIONAL_FEATURES = [
  {
    id: "outfits",
    badge: "✨ AI STYLIST",
    title: "AI Outfit Generator",
    description:
      "Curates complete, harmonized outfits automatically tailored to your lifestyle, preferred fits, and current weather.",
    iconName: "sparkles-outline" as const,
  },
  {
    id: "closet",
    badge: "👕 SMART CLOSET",
    title: "Digital Inventory",
    description:
      "Upload clean photos of your garments. STYRA automatically removes background clutter and tags color, fabric, and category.",
    iconName: "albums-outline" as const,
  },
  {
    id: "briefing",
    badge: "📅 DAILY LOOKS",
    title: "Morning Briefings",
    description:
      "Get fresh daily look suggestions delivered every morning based on your daily schedule and personal style preferences.",
    iconName: "calendar-outline" as const,
  },
  {
    id: "color",
    badge: "🎨 COLOR MATCHING",
    title: "Palette Analysis",
    description:
      "Discover complementary color pairings and color wheel harmonies tailored to your personal aesthetic palette.",
    iconName: "color-palette-outline" as const,
  },
];

export function EmptyWardrobeDashboard({
  userName: _userName,
  onAddClothing,
}: EmptyWardrobeDashboardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Hero Closet Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroImageContainer}>
          <Image
            source={{ uri: STEP1_IMAGES.closet }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Your Wardrobe Awaits</Text>
          <Text style={styles.heroSubtitle}>
            Start building your wardrobe to unlock AI styling, outfit
            suggestions, and daily looks.
          </Text>

          <TouchableOpacity
            onPress={onAddClothing}
            style={styles.primaryCta}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Add Your First Item"
            testID="empty-wardrobe-add-first-cta"
          >
            <Text style={styles.primaryCtaText}>Add Your First Item</Text>
            <Ionicons name="add" size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Supported Categories Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>SUPPORTED CATEGORIES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContent}
        >
          {SUPPORTED_CATEGORIES.map((cat) => (
            <View key={cat.id} style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{cat.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Educational Bento Cards Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>WHAT YOU CAN DO WITH STYRA</Text>
        </View>

        <View style={styles.bentoGrid}>
          {EDUCATIONAL_FEATURES.map((feature) => (
            <View key={feature.id} style={styles.bentoCard}>
              <View style={styles.bentoCardHeader}>
                <View style={styles.bentoIconBox}>
                  <Ionicons
                    name={feature.iconName}
                    size={20}
                    color={colors.textPrimary}
                  />
                </View>
                <View style={styles.bentoBadge}>
                  <Text style={styles.bentoBadgeText}>{feature.badge}</Text>
                </View>
              </View>

              <Text style={styles.bentoTitle}>{feature.title}</Text>
              <Text style={styles.bentoDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.massive,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#EFECE6",
    padding: spacing.md,
    marginBottom: spacing.xl,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  heroImageContainer: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#F5F3EF",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroContent: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    alignItems: "center",
  },
  heroTitle: {
    fontFamily: "serif",
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.textPrimary,
    height: 52,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xxl,
    width: "100%",
  },
  primaryCtaText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  chipsScrollContent: {
    gap: spacing.xs,
  },
  categoryChip: {
    backgroundColor: "#EFECE6",
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  categoryChipText: {
    fontFamily: "serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  bentoGrid: {
    gap: spacing.md,
  },
  bentoCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EFECE6",
    padding: spacing.lg,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  bentoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  bentoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FAF8F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  bentoBadge: {
    backgroundColor: "#FAF8F5",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  bentoBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#7F7C76",
  },
  bentoTitle: {
    fontFamily: "serif",
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  bentoDescription: {
    ...typography.body,
    fontSize: 13,
    color: "#666666",
    lineHeight: 19,
  },
});
