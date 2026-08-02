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
import { STYLE_OPTIONS } from "../config";
import { OnboardingFooter } from "./OnboardingFooter";
import { OnboardingHeader } from "./OnboardingHeader";

interface Step3StylesProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function Step3Styles({
  selectedIds,
  onToggle,
  onContinue,
  onBack,
  onSkip,
}: Step3StylesProps) {
  return (
    <View style={styles.container}>
      <OnboardingHeader currentStep={3} onBack={onBack} title="Curated" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Subtitle */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.heading}>Which styles do you enjoy wearing?</Text>
          <Text style={styles.subheading}>Allow selecting up to three.</Text>
        </View>

        {/* 2-Column Styles Grid */}
        <View style={styles.gridContainer}>
          {STYLE_OPTIONS.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onToggle(item.id)}
                style={[
                  styles.styleCard,
                  isSelected && styles.selectedStyleCard,
                ]}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                {/* Selection Checkmark Badge */}
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
        onNext={onContinue}
        continueLabel="Continue"
        showNextArrow={true}
        centerContinue={false}
        disabled={selectedIds.length === 0}
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
    fontStyle: "italic",
    color: "#666666",
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
  },
  styleCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: "#EFECE6",
    position: "relative",
  },
  selectedStyleCard: {
    borderColor: colors.textPrimary,
    borderWidth: 1.5,
  },
  cardImage: {
    width: "100%",
    height: 110,
    borderRadius: 14,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: "serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
