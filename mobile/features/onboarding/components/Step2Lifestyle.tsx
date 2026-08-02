import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/theme";
import { LIFESTYLE_OPTIONS, STEP2_QUOTE_IMAGE } from "../config";
import { OnboardingFooter } from "./OnboardingFooter";
import { OnboardingHeader } from "./OnboardingHeader";

interface Step2LifestyleProps {
  selectedId?: string;
  onSelect: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function Step2Lifestyle({
  selectedId,
  onSelect,
  onContinue,
  onBack,
  onSkip,
}: Step2LifestyleProps) {
  return (
    <View style={styles.container}>
      <OnboardingHeader currentStep={2} onBack={onBack} title="Curated" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Subtitle */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.heading}>
            What best describes your everyday lifestyle?
          </Text>
          <Text style={styles.subheading}>
            We'll tailor your wardrobe suggestions to match the rhythm of your
            typical week.
          </Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsList}>
          {LIFESTYLE_OPTIONS.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onSelect(item.id)}
                style={[
                  styles.optionCard,
                  isSelected && styles.selectedOptionCard,
                ]}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                {/* Left Icon Box */}
                <View
                  style={[
                    styles.iconBox,
                    isSelected && styles.selectedIconBox,
                  ]}
                >
                  <Ionicons
                    name={item.iconName as any}
                    size={20}
                    color={isSelected ? colors.surface : colors.textPrimary}
                  />
                </View>

                {/* Center Title & Subtitle */}
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                </View>

                {/* Right Radio Indicator */}
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.selectedRadioCircle,
                  ]}
                >
                  {isSelected && <View style={styles.radioInnerDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quote Card */}
        <ImageBackground
          source={{ uri: STEP2_QUOTE_IMAGE }}
          style={styles.quoteCard}
          imageStyle={{ borderRadius: 20 }}
        >
          <View style={styles.quoteOverlay}>
            <View style={styles.quoteBadge}>
              <Text style={styles.quoteBadgeText}>CURATED QUALITY</Text>
            </View>
            <Text style={styles.quoteText}>
              "Style is a way to say who you are without having to speak."
            </Text>
          </View>
        </ImageBackground>
      </ScrollView>

      {/* Footer Navigation */}
      <OnboardingFooter
        onContinue={onContinue}
        onSkip={onSkip}
        showSkipButton={true}
        continueLabel="CONTINUE  >"
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
  },
  heading: {
    fontFamily: "serif",
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 34,
  },
  subheading: {
    ...typography.body,
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  optionsList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  selectedOptionCard: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F5F3EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  selectedIconBox: {
    backgroundColor: colors.textPrimary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: "serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  optionSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: "#7F7C76",
    fontWeight: "500",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#CCCCCC",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadioCircle: {
    borderColor: colors.textPrimary,
  },
  radioInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textPrimary,
  },
  quoteCard: {
    height: 130,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  quoteOverlay: {
    flex: 1,
    backgroundColor: "rgba(250, 248, 245, 0.4)",
    padding: spacing.md,
    justifyContent: "space-between",
  },
  quoteBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  quoteBadgeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textPrimary,
  },
  quoteText: {
    fontFamily: "serif",
    fontSize: 14,
    fontStyle: "italic",
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
