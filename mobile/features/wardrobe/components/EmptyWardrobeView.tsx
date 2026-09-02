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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
import { SearchBar } from "@/components/ui/SearchBar";
import { WardrobeScreenHeader } from "./WardrobeScreenHeader";

interface EmptyWardrobeViewProps {
  onAddClothing: () => void;
  userAvatar?: string | null;
  userName?: string;
  onSearchPress?: () => void;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChangeText?: (text: string) => void;
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

export function EmptyWardrobeView({
  onAddClothing,
  userAvatar,
  userName,
  onSearchPress,
  showSearch,
  searchQuery,
  onSearchChangeText,
}: EmptyWardrobeViewProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Top Header Bar ── */}
      <WardrobeScreenHeader
        userAvatar={userAvatar}
        userName={userName}
        onSearchPress={onSearchPress}
        style={styles.embeddedHeader}
      />

      {/* Optional Search Bar Toggle */}
      {showSearch && onSearchChangeText && (
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery || ""}
            onChangeText={onSearchChangeText}
            placeholder="Search wardrobe..."
            autoFocus
            testID="wardrobe-search-input"
          />
        </View>
      )}

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
          style={styles.chipsScrollView}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: 120,
  },
  embeddedHeader: {
    paddingHorizontal: 0,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  heroCard: {
    backgroundColor: "#F7F5F0",
    borderRadius: 26,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xxl,
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
    backgroundColor: "#141412",
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    width: "100%",
    alignItems: "center",
    boxShadow: "0px 8px 20px rgba(20, 20, 18, 0.35)",
    shadowColor: "#141412",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  } as ViewStyle & { boxShadow?: string },
  heroCtaText: {
    ...typography.button,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
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
  chipsScrollView: {
    overflow: "visible",
  },
  chipsScroll: {
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 4,
    overflow: "visible",
  },
  chip: {
    backgroundColor: "#F7F5F0",
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderWidth: 0,
    boxShadow: "-4px -4px 10px #FFFFFF, 4px 4px 10px rgba(185, 175, 158, 0.55)",
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle & { boxShadow?: string },
  chipText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
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
    backgroundColor: "#F7F5F0",
    borderRadius: 26,
    padding: spacing.xxl,
    alignItems: "center",
    borderWidth: 0,
    boxShadow: "-8px -8px 20px #FFFFFF, 8px 8px 20px rgba(185, 175, 158, 0.7)",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
  hangerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F7F5F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 0,
    boxShadow: "-4px -4px 10px #FFFFFF, 4px 4px 10px rgba(185, 175, 158, 0.55)",
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle & { boxShadow?: string },
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
    backgroundColor: "#F7F5F0",
    borderWidth: 0,
    borderRadius: radius.full,
    paddingVertical: 10,
    paddingHorizontal: spacing.xl,
    boxShadow: "-4px -4px 10px #FFFFFF, 4px 4px 10px rgba(185, 175, 158, 0.55)",
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle & { boxShadow?: string },
  uploadBtnText: {
    ...typography.button,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  aiLockedCard: {
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
