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

interface RateStyraModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RateStyraModal({ visible, onClose }: RateStyraModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        "Thank You for Rating STYRA! ⭐",
        `We appreciate your ${rating}-star review! Your rating helps us build better AI outfit recommendations for everyone.`,
        [{ text: "OK", onPress: () => { setReview(""); onClose(); } }]
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
            accessibilityLabel="Close rate STYRA modal"
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Rate STYRA
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <Ionicons name="star" size={32} color="#D4AF37" />
            <Text style={styles.heroTitle}>Enjoying STYRA AI?</Text>
            <Text style={styles.heroSubtitle}>
              Tap the stars below to rate your experience with AI styling, closet organization, and daily outfits.
            </Text>
          </View>

          {/* Interactive Star Selector */}
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= rating;
              return (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                  style={styles.starBtn}
                >
                  <Ionicons
                    name={active ? "star" : "star-outline"}
                    size={36}
                    color={active ? "#D4AF37" : "#C4C0B6"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.ratingLabel}>
            {rating === 5 && "Love it! Excellent 🌟"}
            {rating === 4 && "Great App! 👍"}
            {rating === 3 && "Good / Fair 👌"}
            {rating === 2 && "Could be better 😐"}
            {rating === 1 && "Needs improvement 🙁"}
          </Text>

          {/* Optional Review Text Input */}
          <Text style={styles.label}>Add a Note (Optional)</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Share what you love or what we could improve..."
            placeholderTextColor="#A09C94"
            value={review}
            onChangeText={setReview}
            textAlignVertical="top"
          />

          <Button
            label={submitting ? "Submitting..." : "Submit Review"}
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
    alignItems: "center",
    backgroundColor: "#F5F3ED",
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#E5E2D9",
    textAlign: "center",
  },
  heroTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  heroSubtitle: {
    ...typography.caption,
    fontSize: 13,
    lineHeight: 18,
    color: "#7F7C76",
    textAlign: "center",
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  starBtn: {
    padding: 4,
  },
  ratingLabel: {
    ...typography.caption,
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
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
    minHeight: 100,
    marginBottom: spacing.lg,
    color: colors.textPrimary,
  },
  submitBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
  },
});
