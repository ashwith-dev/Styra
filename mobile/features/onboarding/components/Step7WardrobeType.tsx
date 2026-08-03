import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface WardrobeOption {
  id: "men" | "women" | "mixed";
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  genderLabel: string;
}

const WARDROBE_OPTIONS: WardrobeOption[] = [
  {
    id: "men",
    title: "Male",
    subtitle: "Curate & filter for Men's clothing categories",
    iconName: "man-outline",
    genderLabel: "Men's Wardrobe",
  },
  {
    id: "women",
    title: "Female",
    subtitle: "Curate & filter for Women's clothing categories",
    iconName: "woman-outline",
    genderLabel: "Women's Wardrobe",
  },
  {
    id: "mixed",
    title: "Others / Unisex",
    subtitle: "Show all clothing categories & styles (Mixed)",
    iconName: "people-outline",
    genderLabel: "Mixed Wardrobe",
  },
];

interface Step7WardrobeTypeProps {
  selectedType?: "men" | "women" | "mixed";
  onSelect: (type: "men" | "women" | "mixed") => void;
  onContinue: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function Step7WardrobeType({
  selectedType,
  onSelect,
  onContinue,
  onBack,
}: Step7WardrobeTypeProps) {
  return (
    <View style={styles.container}>
      {/* Top Bar with Back Navigation */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerStep}>STEP 7 OF 8</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Title & Description */}
      <View style={styles.headingSection}>
        <Text style={styles.title}>Select Your Wardrobe Type</Text>
        <Text style={styles.subtitle}>
          Choose your wardrobe focus. This dynamically tailors your available categories, subcategories, and fit fields.
        </Text>
      </View>

      {/* Wardrobe Options List */}
      <View style={styles.optionsList}>
        {WARDROBE_OPTIONS.map((opt) => {
          const isSelected = selectedType === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => onSelect(opt.id)}
              activeOpacity={0.8}
              style={[styles.card, isSelected && styles.cardSelected]}
              accessibilityRole="button"
              accessibilityLabel={opt.title}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                  <Ionicons
                    name={opt.iconName}
                    size={24}
                    color={isSelected ? colors.surface : colors.textPrimary}
                  />
                </View>
                <View style={styles.textColumn}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {opt.title}
                    </Text>
                    <Text style={[styles.badgeLabel, isSelected && styles.badgeLabelSelected]}>
                      {opt.genderLabel}
                    </Text>
                  </View>
                  <Text style={[styles.cardSubtitle, isSelected && styles.cardSubtitleSelected]}>
                    {opt.subtitle}
                  </Text>
                </View>
              </View>

              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                {isSelected && <View style={styles.radioInnerDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={onContinue}
          disabled={!selectedType}
          style={[styles.continueBtn, !selectedType && styles.continueBtnDisabled]}
          activeOpacity={0.85}
        >
          <Text style={[styles.continueBtnText, !selectedType && styles.continueBtnTextDisabled]}>
            Continue
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={selectedType ? colors.surface : "#A09C94"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  headerStep: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
  },
  headingSection: {
    marginVertical: spacing.md,
  },
  title: {
    fontFamily: "serif",
    fontSize: 30,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    color: "#666666",
    lineHeight: 22,
  },
  optionsList: {
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    marginVertical: spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: "#1A1A1A",
    backgroundColor: "#FAF8F5",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
    marginRight: spacing.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F4F1EA",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSelected: {
    backgroundColor: "#1A1A1A",
  },
  textColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 2,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cardTitleSelected: {
    color: "#000000",
  },
  badgeLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#7F7C76",
    backgroundColor: "#F4F1EA",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeLabelSelected: {
    color: "#1A1A1A",
    backgroundColor: "#E5E1D8",
  },
  cardSubtitle: {
    ...typography.caption,
    fontSize: 13,
    color: "#7F7C76",
    lineHeight: 18,
  },
  cardSubtitleSelected: {
    color: "#333333",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#DCD8CE",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#1A1A1A",
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1A1A1A",
  },
  bottomBar: {
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.textPrimary,
    height: 56,
    borderRadius: radius.full,
    width: "100%",
  },
  continueBtnDisabled: {
    backgroundColor: "#EFECE6",
  },
  continueBtnText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
  },
  continueBtnTextDisabled: {
    color: "#A09C94",
  },
});
