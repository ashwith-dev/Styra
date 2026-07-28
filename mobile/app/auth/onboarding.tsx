import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/theme";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    icon: "shirt-outline",
    title: "Your AI Personal Stylist",
    body: "STYRA learns your style preferences and curates outfits tailored specifically to you.",
  },
  {
    id: "2",
    icon: "cloud-upload-outline",
    title: "Catalogue Your Wardrobe",
    body: "Photograph your clothing and STYRA's AI will categorise and organise everything beautifully.",
  },
  {
    id: "3",
    icon: "sparkles-outline",
    title: "Dressed for Every Moment",
    body: "From casual Sundays to black-tie evenings — receive occasion-perfect looks in seconds.",
  },
];

/**
 * Onboarding screen — shown once after sign-up.
 *
 * Horizontally paginated slides presenting STYRA's core value props.
 * Skip → jumps to last slide.
 * Get Started (last slide) → navigates to the main app.
 */
export default function Onboarding() {
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const goToNext = useCallback(() => {
    if (isLastSlide) {
      router.replace("/wardrobe");
      return;
    }
    const next = currentIndex + 1;
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
    setCurrentIndex(next);
  }, [currentIndex, isLastSlide]);

  const goToLast = useCallback(() => {
    const last = SLIDES.length - 1;
    flatListRef.current?.scrollToIndex({ index: last, animated: true });
    setCurrentIndex(last);
  }, []);

  const onMomentumScrollEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setCurrentIndex(index);
    },
    [],
  );

  const renderSlide: ListRenderItem<Slide> = ({ item }) => (
    <View style={styles.slide} accessibilityLabel={item.title}>
      {/* Illustration area */}
      <View style={styles.illustrationWrapper}>
        <Ionicons name={item.icon} size={64} color={colors.textPrimary} />
      </View>

      {/* Copy */}
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideBody}>{item.body}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Skip — hidden on last slide */}
      <View style={styles.topRow}>
        <View style={styles.brand}>
          <Text style={styles.brandText}>STYRA</Text>
        </View>
        {!isLastSlide && (
          <TouchableOpacity
            onPress={goToLast}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            testID="onboarding-skip"
          >
            <Text style={styles.skipLabel}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        testID="onboarding-slides"
      />

      {/* Pagination dots */}
      <View style={styles.paginationRow}>
        {SLIDES.map((_, i) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (i - 1) * SCREEN_WIDTH,
              i * SCREEN_WIDTH,
              (i + 1) * SCREEN_WIDTH,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          const width = scrollX.interpolate({
            inputRange: [
              (i - 1) * SCREEN_WIDTH,
              i * SCREEN_WIDTH,
              (i + 1) * SCREEN_WIDTH,
            ],
            outputRange: [6, 20, 6],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={i}
              style={[styles.dot, { opacity, width }]}
            />
          );
        })}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <Button
          label={isLastSlide ? "Get Started" : "Next"}
          onPress={goToNext}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.ctaBtn}
          testID="onboarding-next"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  brand: {},
  brandText: {
    ...typography.label,
    fontSize: 13,
    letterSpacing: 4,
    color: colors.textPrimary,
  },
  skipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  illustrationWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxxl,
  },
  slideTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  slideBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 300,
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  dot: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  ctaBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    alignSelf: "stretch",
  },
});
