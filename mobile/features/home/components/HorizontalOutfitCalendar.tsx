/**
 * HorizontalOutfitCalendar.tsx
 *
 * Reusable premium 10-day horizontal mini calendar component for STYRA home screen.
 * Displays a rolling window of 3 past days, Today, and 6 future days.
 */

import React, { useCallback, useMemo, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { colors, radius, spacing } from "@/theme";
import type { CalendarDay } from "@/hooks/useOutfitCalendar";

interface HorizontalOutfitCalendarProps {
  days: CalendarDay[];
  onSelectDate: (dateStr: string) => void;
  todayIndex?: number;
}

const ITEM_WIDTH = 48;
const ITEM_MARGIN = 6;
const CARD_TOTAL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;
// The Today card renders slightly wider than the others (see styles).
const TODAY_EXTRA_WIDTH = 4;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function HorizontalOutfitCalendar({
  days,
  onSelectDate,
  todayIndex = 3,
}: HorizontalOutfitCalendarProps) {
  const flatListRef = useRef<FlatList>(null);

  // Per-card snap offsets — a fixed snapToInterval drifts because the
  // Today card is wider and the content has a horizontal inset.
  const snapOffsets = useMemo(() => {
    const offsets: number[] = [];
    let acc = 0;
    for (let i = 0; i < days.length; i++) {
      offsets.push(acc);
      acc += CARD_TOTAL_WIDTH + (i === todayIndex ? TODAY_EXTRA_WIDTH : 0);
    }
    return offsets;
  }, [days.length, todayIndex]);

  // Center Today once the list has laid out (scrollToOffset before first
  // layout is unreliable, especially on Android).
  const didInitialScroll = useRef(false);
  const handleLayout = useCallback(() => {
    if (didInitialScroll.current) return;
    if (todayIndex < 0 || days.length <= todayIndex || snapOffsets.length <= todayIndex) return;
    didInitialScroll.current = true;
    const todayWidth = CARD_TOTAL_WIDTH + TODAY_EXTRA_WIDTH;
    const offset = snapOffsets[todayIndex] - (SCREEN_WIDTH / 2 - todayWidth / 2);
    flatListRef.current?.scrollToOffset({ offset: Math.max(0, offset), animated: false });
  }, [days.length, todayIndex, snapOffsets]);

  const renderItem = useCallback(
    ({ item }: { item: CalendarDay }) => {
      const { date, dayNum, weekday, hasOutfit, isPast, isToday, isSelected } = item;

      // Status indicator color: Green if outfit exists, Red if not
      const dotColor = hasOutfit ? colors.success : "#E53935";

      return (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onSelectDate(date)}
          style={[
            styles.dayCard,
            isToday && styles.todayCard,
            isSelected && !isToday && styles.selectedCard,
            isPast && styles.pastCard,
          ]}
        >
          {/* Top: Status Dot */}
          <View
            style={[
              styles.dot,
              { backgroundColor: dotColor },
              isPast && styles.pastDot,
            ]}
          />

          {/* Middle: Day Number */}
          <Text
            style={[
              styles.dayNum,
              isToday && styles.todayText,
              isSelected && !isToday && styles.selectedText,
              isPast && styles.pastText,
            ]}
          >
            {dayNum}
          </Text>

          {/* Bottom: Weekday */}
          <Text
            style={[
              styles.weekday,
              isToday && styles.todaySubtext,
              isSelected && !isToday && styles.selectedSubtext,
              isPast && styles.pastSubtext,
            ]}
          >
            {isToday ? "Today" : weekday}
          </Text>
        </TouchableOpacity>
      );
    },
    [onSelectDate],
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={days}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToOffsets={snapOffsets}
        onLayout={handleLayout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    alignItems: "center",
  },
  dayCard: {
    width: ITEM_WIDTH,
    height: 72,
    marginHorizontal: ITEM_MARGIN,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs + 2,
  },
  todayCard: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
    width: ITEM_WIDTH + 4,
    height: 76,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedCard: {
    borderColor: colors.textPrimary,
    borderWidth: 2,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pastCard: {
    opacity: 0.55,
    backgroundColor: colors.background,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pastDot: {
    opacity: 0.6,
  },
  dayNum: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  todayText: {
    color: colors.surface,
    fontSize: 17,
  },
  selectedText: {
    color: colors.textPrimary,
    fontWeight: "800",
  },
  pastText: {
    color: colors.textSecondary,
  },
  weekday: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  todaySubtext: {
    color: colors.surface,
    opacity: 0.9,
    fontSize: 9,
    fontWeight: "700",
  },
  selectedSubtext: {
    color: colors.textPrimary,
  },
  pastSubtext: {
    color: colors.textSecondary,
    opacity: 0.8,
  },
});
