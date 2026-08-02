import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/theme";
import { FIT_OPTIONS } from "../config";
import { OnboardingFooter } from "./OnboardingFooter";
import { OnboardingHeader } from "./OnboardingHeader";

interface Step5FitProps {
  selectedId?: string;
  onSelect: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function Step5Fit({
  selectedId,
  onSelect,
  onContinue,
  onBack,
  onSkip,
}: Step5FitProps) {
  return (
    <View style={styles.container}>
      <OnboardingHeader currentStep={5} onBack={onBack} title="Curated" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Subtitle */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.heading}>How do you prefer your clothes to fit?</Text>
          <Text style={styles.subheading}>
            This helps us tailor our algorithmic curation to your personal silhouette
            and comfort levels.
          </Text>
        </View>

        {/* Fit Option Cards */}
        <View style={styles.cardsList}>
          {FIT_OPTIONS.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onSelect(item.id)}
                style={[
                  styles.fitCard,
                  isSelected && styles.selectedFitCard,
                ]}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color={colors.surface} />
                  </View>
                )}

                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <OnboardingFooter
        onContinue={onContinue}
        onSkip={onSkip}
        showSkipButton={true}
        continueLabel="Continue  >"
        disabled={!selectedId}
      />
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
    paddingBottom: spacing.lg,
  },
  headerTextContainer: {
    marginVertical: spacing.md,
    alignItems: "center",
  },
  heading: {
    fontFamily: "serif",
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
    lineHeight: 34,
  },
  subheading: {
    ...typography.body,
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
  cardsList: {
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  fitCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#EFECE6",
    alignItems: "center",
    position: "relative",
  },
  selectedFitCard: {
    borderColor: colors.textPrimary,
    borderWidth: 1.5,
  },
  cardImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontFamily: "serif",
    fontSize: 22,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  cardDescription: {
    ...typography.body,
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
  checkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
