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

interface TermsConditionsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TermsConditionsModal({ visible, onClose }: TermsConditionsModalProps) {
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
            accessibilityLabel="Close terms and conditions"
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Terms & Conditions
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <Ionicons name="document-text-outline" size={28} color="#1A1A1A" />
            <View style={styles.heroTextWrapper}>
              <Text style={styles.heroTitle}>Terms of Service & Usage</Text>
              <Text style={styles.heroSubtitle}>
                Last updated: August 2026. Please read these terms carefully before using STYRA AI features.
              </Text>
            </View>
          </View>

          {/* Terms Content Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionBody}>
              By downloading, creating an account, or using the STYRA application, you agree to comply with and be bound by these Terms & Conditions. If you do not agree to these terms, you should discontinue using the service immediately.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. AI Recommendation Services</Text>
            <Text style={styles.sectionBody}>
              STYRA provides algorithmic and generative AI outfit recommendations based on user-supplied clothing images, weather feeds, and preference parameters. While we aim for high visual harmony, recommendations are provided "as-is" for personal styling inspiration.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Content & Image Ownership</Text>
            <Text style={styles.sectionBody}>
              You retain 100% ownership of all images, photos, and clothing items uploaded to your closet. You grant STYRA a limited, non-exclusive license solely to host, process, segment, and display your images within your account interface.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Prohibited Activities</Text>
            <Text style={styles.sectionBody}>
              Users agree not to upload illegal, offensive, or copyrighted material to which they do not hold rights. Reverse engineering the AI pipeline or attempting unauthorized access to other users' closet data is strictly prohibited.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Account Termination & Liability</Text>
            <Text style={styles.sectionBody}>
              STYRA reserves the right to suspend or terminate accounts that violate terms of service. Under no circumstances shall STYRA be liable for indirect or consequential damages arising from service downtime or external API provider changes.
            </Text>
          </View>

          <Button
            label="I Understand & Close"
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
  heroCard: {
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
  heroTextWrapper: {
    flex: 1,
  },
  heroTitle: {
    ...typography.caption,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  heroSubtitle: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
    color: "#7F7C76",
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
    marginTop: spacing.lg,
  },
});
