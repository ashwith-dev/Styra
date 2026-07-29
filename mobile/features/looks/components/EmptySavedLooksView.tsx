import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
import { SavedLooksHeaderSection } from "./SavedLooksHeaderSection";

const HERO_LOOKS_IMAGE = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";

export function EmptySavedLooksView() {
  const handleCreateOutfit = () => {
    router.push("/recommendations");
  };

  const handleExploreWardrobe = () => {
    router.push("/wardrobe");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Title Header Section inside ScrollView ── */}
      <SavedLooksHeaderSection count={0} />

      {/* ── Top Hero Card ── */}
      <View style={styles.heroCard}>
        <Image
          source={{ uri: HERO_LOOKS_IMAGE }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <Text style={styles.heroTitle}>No Saved Looks Yet</Text>
        <Text style={styles.heroDescription}>
          Every great wardrobe starts with inspiration. Create outfits using your
          AI Stylist and save your favourites so they're always ready for any
          occasion.
        </Text>

        <TouchableOpacity
          onPress={handleCreateOutfit}
          style={styles.primaryBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Create Your First Outfit"
        >
          <Text style={styles.primaryBtnText}>Create Your First Outfit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleExploreWardrobe}
          style={styles.secondaryLinkBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Explore Your Wardrobe"
        >
          <Text style={styles.secondaryLinkText}>Explore Your Wardrobe</Text>
        </TouchableOpacity>
      </View>

      {/* ── 3 Feature Informational Cards ── */}
      <View style={styles.featuresContainer}>
        {/* Card 1 */}
        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="star" size={18} color="#1A1A1A" />
          </View>
          <Text style={styles.featureLabel}>SAVE FAVOURITE OUTFITS</Text>
          <Text style={styles.featureBody}>
            Quickly save outfits you love and access them anytime.
          </Text>
        </View>

        {/* Card 2 */}
        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="reload" size={18} color="#1A1A1A" />
          </View>
          <Text style={styles.featureLabel}>WEAR AGAIN</Text>
          <Text style={styles.featureBody}>
            Reuse your favourite looks with one tap for instant style.
          </Text>
        </View>

        {/* Card 3 */}
        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={18} color="#1A1A1A" />
          </View>
          <Text style={styles.featureLabel}>AI STYLING HISTORY</Text>
          <Text style={styles.featureBody}>
            Build a personal collection of AI-generated outfits for every mood.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: "center",
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
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
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  heroDescription: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: "#1A1A1A",
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  primaryBtnText: {
    ...typography.button,
    color: colors.surface,
    fontSize: 15,
  },
  secondaryLinkBtn: {
    paddingVertical: spacing.xs,
  },
  secondaryLinkText: {
    ...typography.caption,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    textDecorationLine: "underline",
  },
  featuresContainer: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  featureCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F4F1EA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  featureLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  featureBody: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
