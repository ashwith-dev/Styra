import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
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
    backgroundColor: "#F7F5F0",
    borderRadius: 26,
    padding: spacing.xl,
    alignItems: "center",
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
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
    backgroundColor: "#141412",
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.md,
    boxShadow: "0px 8px 20px rgba(20, 20, 18, 0.35)",
    shadowColor: "#141412",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  } as ViewStyle & { boxShadow?: string },
  primaryBtnText: {
    ...typography.button,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryLinkBtn: {
    paddingVertical: spacing.xs,
  },
  secondaryLinkText: {
    ...typography.caption,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    textDecorationLine: "underline",
  },
  featuresContainer: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  featureCard: {
    backgroundColor: "#F7F5F0",
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7F5F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 0,
    boxShadow: "-3px -3px 8px #FFFFFF, 3px 3px 8px rgba(185, 175, 158, 0.5)",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  } as ViewStyle & { boxShadow?: string },
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
