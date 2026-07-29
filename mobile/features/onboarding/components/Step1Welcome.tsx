import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
import { STEP1_IMAGES } from "../config";
import { ProgressDots } from "./ProgressDots";

interface Step1WelcomeProps {
  onGetStarted: () => void;
}

export function Step1Welcome({ onGetStarted }: Step1WelcomeProps) {
  return (
    <View style={styles.container}>
      {/* Top Header Logo */}
      <View style={styles.header}>
        <Text style={styles.logoText}>STYRA</Text>
      </View>

      {/* Hero 3-Image Grid */}
      <View style={styles.gridContainer}>
        {/* Left Column: Tall Coat Image */}
        <View style={styles.leftColumn}>
          <Image
            source={{ uri: STEP1_IMAGES.coat }}
            style={styles.tallImage}
            resizeMode="cover"
          />
        </View>

        {/* Right Column: Bag & Closet Images */}
        <View style={styles.rightColumn}>
          <Image
            source={{ uri: STEP1_IMAGES.bag }}
            style={styles.squareImage}
            resizeMode="cover"
          />
          <Image
            source={{ uri: STEP1_IMAGES.closet }}
            style={styles.mediumImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Progress Dots */}
      <View style={styles.dotsWrapper}>
        <ProgressDots currentStep={1} />
      </View>

      {/* Welcome Headline & Description */}
      <View style={styles.textContainer}>
        <Text style={styles.heading}>Welcome to STYRA.</Text>
        <Text style={styles.subheading}>
          Let's personalise your AI stylist. This takes less than a minute.
        </Text>
      </View>

      {/* Get Started Primary Action Pill Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={onGetStarted}
          style={styles.button}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Get Started"
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.surface} />
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
  header: {
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  logoText: {
    fontFamily: "serif",
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: 3,
  },
  gridContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    height: 320,
    marginVertical: spacing.sm,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  tallImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  squareImage: {
    width: "100%",
    height: 145,
    borderRadius: 20,
  },
  mediumImage: {
    width: "100%",
    flex: 1,
    borderRadius: 20,
  },
  dotsWrapper: {
    alignItems: "flex-start",
    marginTop: spacing.xs,
  },
  textContainer: {
    marginVertical: spacing.md,
  },
  heading: {
    fontFamily: "serif",
    fontSize: 34,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subheading: {
    ...typography.body,
    fontSize: 16,
    color: "#555555",
    lineHeight: 24,
  },
  bottomBar: {
    marginBottom: spacing.xl,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.textPrimary,
    height: 56,
    borderRadius: radius.full,
    width: "100%",
  },
  buttonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
  },
});
