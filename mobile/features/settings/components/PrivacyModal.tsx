import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { colors, radius, spacing, typography } from "@/theme";

interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PrivacyModal({ visible, onClose }: PrivacyModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close privacy modal"
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Privacy & Data Security
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Subtitle Banner */}
          <View style={styles.banner}>
            <Ionicons name="shield-checkmark" size={24} color="#1A1A1A" />
            <Text style={styles.bannerText}>
              Your privacy is fundamental to STYRA. Learn how your wardrobe data, AI style profile, and personal details are safeguarded.
            </Text>
          </View>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Wardrobe & Photo Security</Text>
            <Text style={styles.sectionBody}>
              All garment photos uploaded to STYRA are processed using encrypted network channels. Images are used exclusively for automated background removal, clothing category classification, and generating personalized outfit suggestions. We never sell, license, or share your wardrobe images with third-party advertisers.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. AI Style Profile Data</Text>
            <Text style={styles.sectionBody}>
              Your style preferences, favorite colors, fit selections, and sizing parameters are stored in your private user profile. This data is processed solely by STYRA's AI recommendation engine to curate accurate, context-aware daily outfit recommendations tailored to your wardrobe.
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Data Storage & Row-Level Protection</Text>
            <Text style={styles.sectionBody}>
              Account details are secured using PostgreSQL Row-Level Security (RLS) policies. Only your authenticated session can read or modify your wardrobe and preference records. All data transfers use TLS 1.3 encryption, and data at rest is encrypted using AES-256 standards.
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Location & Weather Information</Text>
            <Text style={styles.sectionBody}>
              When weather-aware outfit recommendations are enabled, STYRA uses approximate location data to fetch local temperature and forecast details. Your precise GPS coordinates are never stored permanently on our servers or linked to tracking profiles.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Your Rights & Data Deletion</Text>
            <Text style={styles.sectionBody}>
              You retain full control over your data. You can clear local caches at any time or permanently delete your account directly via Settings → Delete Account. Permanent deletion immediately and irreversibly purges all clothing items, saved outfits, wear history, and profile data from our databases.
            </Text>
          </View>

          <Button
            label="Close"
            onPress={onClose}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.closeBtn}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    borderBottomColor: "#EFECE6",
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "#F5F3ED",
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#E5E2D9",
  },
  bannerText: {
    ...typography.caption,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#52504C",
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionBody: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "#52504C",
  },
  closeBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
});
