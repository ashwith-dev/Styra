import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
import { STEP7_READY_IMAGE } from "../config";
import { OnboardingHeader } from "./OnboardingHeader";

interface Step7ReadyProps {
  onAddFirstItem: () => void;
  onGoToHome: () => void;
  onBack: () => void;
}

export function Step7Ready({
  onAddFirstItem,
  onGoToHome,
  onBack,
}: Step7ReadyProps) {
  return (
    <View style={styles.container}>
      <OnboardingHeader currentStep={7} onBack={onBack} title="Curated" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Card */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: STEP7_READY_IMAGE }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.systemReadyBadge}>
            <Ionicons name="sparkles" size={12} color={colors.textPrimary} />
            <Text style={styles.systemReadyText}>SYSTEM READY</Text>
          </View>
        </View>

        {/* Message Card */}
        <View style={styles.messageCard}>
          <Text style={styles.completeTag}>ONBOARDING COMPLETE</Text>
          <Text style={styles.heading}>Your stylist is ready.</Text>
          <Text style={styles.subheading}>Let's build your wardrobe.</Text>
        </View>

        {/* Final Step 7 & 100% Card */}
        <View style={styles.actionCard}>
          <View style={styles.progressRow}>
            <Text style={styles.stepText}>Step 7 of 7</Text>
            <Text style={styles.percentText}>100%</Text>
          </View>

          {/* 100% Filled Progress Segments Bar */}
          <View style={styles.segmentsRow}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View key={i} style={styles.filledSegment} />
            ))}
          </View>

          {/* Action Buttons: Add First Item & Go To Home */}
          <View style={styles.buttonsColumn}>
            <TouchableOpacity
              onPress={onAddFirstItem}
              style={styles.addBtn}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Add My First Item"
            >
              <Text style={styles.addBtnText}>Add My First Item</Text>
              <Ionicons name="add" size={18} color={colors.surface} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onGoToHome}
              style={styles.homeBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Go to Home Dashboard"
            >
              <Text style={styles.homeBtnText}>Go to Home Dashboard</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.massive,
    gap: spacing.md,
  },
  heroCard: {
    height: 280,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#EFECE6",
    marginTop: spacing.xs,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  systemReadyBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  systemReadyText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textPrimary,
  },
  messageCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  completeTag: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#7F7C76",
    marginBottom: spacing.xs,
  },
  heading: {
    fontFamily: "serif",
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.body,
    fontSize: 15,
    color: "#666666",
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  stepText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  percentText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  segmentsRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: spacing.lg,
  },
  filledSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textPrimary,
  },
  buttonsColumn: {
    gap: spacing.sm,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
  },
  addBtnText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface,
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 50,
    borderRadius: radius.full,
    backgroundColor: "#F4F1EA",
    borderWidth: 1,
    borderColor: "#E5E1D8",
  },
  homeBtnText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
