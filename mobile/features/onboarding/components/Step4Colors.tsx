import { useState } from "react";
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
import { MAIN_COLOR_OPTIONS, STEP4_FABRIC_IMAGE } from "../config";
import { MoreColoursModal } from "./MoreColoursModal";
import { OnboardingFooter } from "./OnboardingFooter";
import { OnboardingHeader } from "./OnboardingHeader";

interface Step4ColorsProps {
  selectedColors: string[];
  otherColor?: boolean;
  onToggleColor: (colorName: string) => void;
  onToggleOtherColor: () => void;
  onContinue: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function Step4Colors({
  selectedColors,
  otherColor = false,
  onToggleColor,
  onToggleOtherColor,
  onContinue,
  onBack,
  onSkip,
}: Step4ColorsProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Count of selected custom shades (colors selected from More Colours that are not in main colors)
  const mainNames = new Set(MAIN_COLOR_OPTIONS.map((c) => c.name));
  const customShadesCount = selectedColors.filter((name) => !mainNames.has(name)).length;

  return (
    <View style={styles.container}>
      <OnboardingHeader currentStep={4} onBack={onBack} title="Curated" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Subtitle */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.heading}>Which colours do you wear most?</Text>
          <Text style={styles.subheading}>
            Select all that apply. This helps us curate a palette that feels
            authentically you.
          </Text>
        </View>

        {/* Main 11 Colours Grid + More Colours Card + Other Option */}
        <View style={styles.gridContainer}>
          {MAIN_COLOR_OPTIONS.map((item) => {
            const isSelected = selectedColors.includes(item.name);
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onToggleColor(item.name)}
                style={[
                  styles.colorCard,
                  isSelected && styles.selectedColorCard,
                ]}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={item.name}
              >
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={10} color={colors.surface} />
                  </View>
                )}

                {/* Color Swatch Circle */}
                <View
                  style={[
                    styles.swatchCircle,
                    { backgroundColor: item.hex },
                    item.borderColor
                      ? { borderWidth: 1, borderColor: item.borderColor }
                      : null,
                  ]}
                />

                <Text style={styles.colorName}>{item.name}</Text>
              </TouchableOpacity>
            );
          })}

          {/* More Colours Action Card */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={[
              styles.colorCard,
              styles.moreCard,
              customShadesCount > 0 && styles.selectedColorCard,
            ]}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="More Colours"
          >
            {customShadesCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{customShadesCount}</Text>
              </View>
            )}

            <View style={styles.paletteIconCircle}>
              <Ionicons name="color-palette-outline" size={22} color={colors.textPrimary} />
            </View>

            <Text style={styles.colorName}>More Colours</Text>
          </TouchableOpacity>

          {/* Other Option Card */}
          <TouchableOpacity
            onPress={onToggleOtherColor}
            style={[
              styles.colorCard,
              otherColor && styles.selectedColorCard,
            ]}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Other"
          >
            {otherColor && (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={10} color={colors.surface} />
              </View>
            )}

            <View style={styles.otherIconCircle}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.textPrimary} />
            </View>

            <Text style={styles.colorName}>Other</Text>
          </TouchableOpacity>
        </View>

        {/* Fabric Swatch Image Card at Bottom */}
        <View style={styles.fabricCard}>
          <Image
            source={{ uri: STEP4_FABRIC_IMAGE }}
            style={styles.fabricImage}
            resizeMode="cover"
          />
        </View>
      </ScrollView>

      {/* More Colours Bottom Sheet Modal */}
      <MoreColoursModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedColors={selectedColors}
        onToggleColor={onToggleColor}
      />

      {/* Footer Navigation */}
      <OnboardingFooter
        onContinue={onContinue}
        onSkip={onSkip}
        showSkipButton={true}
        continueLabel="Continue  >"
        disabled={selectedColors.length === 0 && !otherColor}
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
    marginBottom: spacing.lg,
  },
  colorCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EFECE6",
    position: "relative",
  },
  selectedColorCard: {
    borderColor: colors.textPrimary,
    borderWidth: 1.5,
  },
  moreCard: {
    backgroundColor: "#FAF8F5",
  },
  swatchCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: spacing.xs,
  },
  paletteIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EAE7E1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  otherIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EAE7E1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  colorName: {
    fontFamily: "serif",
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: colors.surface,
  },
  fabricCard: {
    height: 120,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  fabricImage: {
    width: "100%",
    height: "100%",
  },
});
