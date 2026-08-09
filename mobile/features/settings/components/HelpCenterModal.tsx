import { useState } from "react";
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

interface HelpCenterModalProps {
  visible: boolean;
  onClose: () => void;
}

const FAQS = [
  {
    question: "How does STYRA generate outfit recommendations?",
    answer:
      "STYRA analyzes your wardrobe items, taxonomy attributes, current weather, and event occasion using Advanced Multi-Level Candidate Ranking and Gemini AI to suggest stylish, harmonious outfits.",
  },
  {
    question: "How do I upload and manage clothing items?",
    answer:
      "Tap the '+' icon on the navigation bar to take or upload a garment photo. STYRA automatically removes background noise, detects category and colors, and saves the item to your digital closet.",
  },
  {
    question: "Can I customize my daily AI style preferences?",
    answer:
      "Yes! Go to Profile → AI Style Profile to select your preferred aesthetics (e.g. Minimalist, Smart Casual, Streetwear), favorite colors, fit preference, and lifestyle parameters.",
  },
  {
    question: "What does 'Wear Today' do?",
    answer:
      "Tapping 'Wear Today' records the outfit in your Wear History calendar, preventing the AI from repeating the exact same outfit combination too frequently.",
  },
  {
    question: "Is my wardrobe data private and secure?",
    answer:
      "Absolutely. All uploaded clothing images and profile metrics are protected with PostgreSQL Row-Level Security (RLS) and TLS encryption. Your photos are never shared with third parties.",
  },
];

export function HelpCenterModal({ visible, onClose }: HelpCenterModalProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

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
            accessibilityLabel="Close help centre"
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Help Centre
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <Ionicons name="help-buoy-outline" size={28} color="#1A1A1A" />
            <View style={styles.heroTextWrapper}>
              <Text style={styles.heroTitle}>Frequently Asked Questions</Text>
              <Text style={styles.heroSubtitle}>
                Find answers and guides on STYRA AI features, closet management, and outfit generation.
              </Text>
            </View>
          </View>

          {/* FAQ Accordion */}
          {FAQS.map((faq, idx) => {
            const isOpen = expandedIdx === idx;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => toggleFaq(idx)}
                activeOpacity={0.8}
                style={styles.faqCard}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#7F7C76"
                  />
                </View>
                {isOpen && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
              </TouchableOpacity>
            );
          })}

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
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  faqQuestion: {
    ...typography.caption,
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  faqAnswer: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: "#52504C",
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EFECE6",
  },
  closeBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    marginTop: spacing.lg,
  },
});
