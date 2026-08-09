import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, typography } from "@/theme";
import { STEP1_IMAGES } from "@/features/onboarding/config";
import { homeTokens, neumorphicStyles } from "../theme/homeTokens";
import { MinItemsRequirementsCard } from "./MinItemsRequirementsCard";

interface EmptyWardrobeDashboardProps {
  userName?: string | null;
  onAddClothing: () => void;
}

const SUPPORTED_CATEGORIES = [
  { id: "tops", label: "Tops", icon: "shirt-outline" },
  { id: "bottoms", label: "Bottoms", icon: "layers-outline" },
  { id: "shoes", label: "Shoes", icon: "footsteps-outline" },
  { id: "dresses", label: "Dresses", icon: "woman-outline" },
  { id: "outerwear", label: "Outerwear", icon: "archive-outline" },
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
      {/* Hero Closet Card — Neumorphic Raised Panel molded from #F7F5F0 */}
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
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Minimum Requirements Card for Outfit Generation (Tops 2, Bottoms 2, Footwear 1) */}
      <MinItemsRequirementsCard
        topsCount={0}
        requiredTops={2}
        bottomsCount={0}
        requiredBottoms={2}
        footwearCount={0}
        requiredFootwear={1}
        onAddClothing={onAddClothing}
      />

      {/* Supported Categories Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>SUPPORTED CATEGORIES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScrollView}
          contentContainerStyle={styles.chipsScrollContent}
        >
          {SUPPORTED_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryChip}
              activeOpacity={0.8}
            >
              <View style={styles.chipIconBox}>
                <Ionicons
                  name={cat.icon as any}
                  size={15}
                  color={homeTokens.textPrimary}
                />
              </View>
              <Text style={styles.categoryChipText}>{cat.label}</Text>
            </TouchableOpacity>
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
                    color={homeTokens.textPrimary}
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
    ...neumorphicStyles.raised,
    borderRadius: 32,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  heroImageContainer: {
    width: "100%",
    height: 210,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#EFECE6",
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
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 26,
    fontWeight: "700",
    color: homeTokens.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: homeTokens.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  primaryCta: {
    ...neumorphicStyles.elevatedDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 52,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xxl,
    width: "100%",
  },
  primaryCtaText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
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
    color: homeTokens.textSecondary,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  chipsScrollView: {
    overflow: "visible",
  },
  chipsScrollContent: {
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: 4,
    overflow: "visible",
  },
  categoryChip: {
    backgroundColor: "#F7F5F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 0,
    boxShadow: "-4px -4px 10px #FFFFFF, 4px 4px 10px rgba(185, 175, 158, 0.55)",
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chipIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F7F5F0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
  },
  categoryChipText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 14,
    fontWeight: "600",
    color: homeTokens.textPrimary,
  },
  bentoGrid: {
    gap: spacing.md,
  },
  bentoCard: {
    backgroundColor: "#F7F5F0",
    borderRadius: 26,
    padding: spacing.lg,
    minHeight: 185,
    justifyContent: "space-between",
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  bentoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  bentoIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: homeTokens.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  bentoBadge: {
    backgroundColor: homeTokens.surface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  bentoBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: homeTokens.textSecondary,
  },
  bentoTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 20,
    fontWeight: "700",
    color: homeTokens.textPrimary,
    marginBottom: spacing.xs,
  },
  bentoDescription: {
    ...typography.body,
    fontSize: 13,
    color: "#666460",
    lineHeight: 19,
  },
});
