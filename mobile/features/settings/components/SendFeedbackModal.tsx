import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { colors, radius, spacing, typography } from "@/theme";

interface SendFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Feature Request",
  "Bug Report",
  "AI Styling Quality",
  "Closet Management",
  "General Thought",
];

export function SendFeedbackModal({ visible, onClose }: SendFeedbackModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("Feature Request");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert("Feedback Required", "Please enter your thoughts before submitting.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        "Thank You!",
        "Your feedback has been received. Our team uses your thoughts to directly shape future updates.",
        [{ text: "OK", onPress: () => { setMessage(""); onClose(); } }]
      );
    }, 600);
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
            accessibilityLabel="Close send feedback modal"
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Send Feedback
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Subtitle Card */}
          <View style={styles.heroCard}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color="#1A1A1A" />
            <View style={styles.heroTextWrapper}>
              <Text style={styles.heroTitle}>Help Us Improve STYRA</Text>
              <Text style={styles.heroSubtitle}>
                Tell us what feature you'd love to see next, report an issue, or share your styling thoughts.
              </Text>
            </View>
          </View>

          {/* Category Chips */}
          <Text style={styles.label}>Select Category</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback Text Input */}
          <Text style={styles.label}>Your Feedback</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            placeholder="Describe your feedback, feature ideas, or issues here..."
            placeholderTextColor="#A09C94"
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />

          <Button
            label={submitting ? "Sending..." : "Submit Feedback"}
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.submitBtn}
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
  label: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: "#F4F1EA",
    borderRadius: radius.full,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#1A1A1A",
    borderColor: "#1A1A1A",
  },
  chipText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  textArea: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    marginBottom: spacing.lg,
    color: colors.textPrimary,
  },
  submitBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
  },
});
