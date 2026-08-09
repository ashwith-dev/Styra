/**
 * HorizontalOutfitCalendar.tsx
 *
 * Premium 10-day horizontal mini calendar component for STYRA home screen.
 * Soft, smooth Neumorphic depth with zero shadow clipping or box smudges.
 */

import React, { useCallback, useMemo, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  type ViewStyle,
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
const TODAY_EXTRA_WIDTH = 4;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function HorizontalOutfitCalendar({
  days,
  onSelectDate,
  todayIndex = 3,
}: HorizontalOutfitCalendarProps) {
  const flatListRef = useRef<FlatList>(null);

  const snapOffsets = useMemo(() => {
    const offsets: number[] = [];
    let acc = 0;
    for (let i = 0; i < days.length; i++) {
      offsets.push(acc);
      acc += CARD_TOTAL_WIDTH + (i === todayIndex ? TODAY_EXTRA_WIDTH : 0);
    }
    return offsets;
  }, [days.length, todayIndex]);

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
            isPast && !isToday && styles.pastCard,
          ]}
        >
          {/* Top: Status Dot */}
          <View
            style={[
              styles.dot,
              { backgroundColor: dotColor },
              isPast && !isToday && styles.pastDot,
            ]}
          />

          {/* Middle: Day Number */}
          <Text
            style={[
              styles.dayNum,
              isToday && styles.todayText,
              isSelected && !isToday && styles.selectedText,
              isPast && !isToday && styles.pastText,
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
              isPast && !isToday && styles.pastSubtext,
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
        style={{ overflow: "visible" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xs,
    overflow: "visible",
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    alignItems: "center",
  },
  dayCard: {
    backgroundColor: "#F7F5F0",
    width: ITEM_WIDTH,
    height: 72,
    marginHorizontal: ITEM_MARGIN,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs + 2,
    borderWidth: 0,
    boxShadow: "-5px -5px 12px #FFFFFF, 5px 5px 12px rgba(185, 175, 158, 0.55)",
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  } as ViewStyle & { boxShadow?: string },
  todayCard: {
    backgroundColor: "#141412",
    width: ITEM_WIDTH + 4,
    height: 76,
    borderRadius: 24,
    borderWidth: 0,
    boxShadow: "0px 6px 16px rgba(20, 20, 18, 0.35)",
    shadowColor: "#141412",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  } as ViewStyle & { boxShadow?: string },
  selectedCard: {
    borderColor: colors.textPrimary,
    borderWidth: 2,
  },
  pastCard: {
    opacity: 0.65,
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
    color: "#FFFFFF",
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
    color: "#FFFFFF",
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
