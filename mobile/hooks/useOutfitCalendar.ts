/**
 * useOutfitCalendar.ts
 *
 * Manages state and logic for the 10-day horizontal outfit calendar.
 * Window: 3 past days, Today, 6 future days.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchOutfitCalendar } from "@/lib/api";

export interface CalendarDay {
  date: string; // "YYYY-MM-DD"
  dayNum: number; // 15
  weekday: string; // "Tue"
  hasOutfit: boolean;
  isPast: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Local-timezone "YYYY-MM-DD" — the single day-key format for the app. */
export function formatDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useOutfitCalendar() {
  // "Today" is state (not a mount-time constant) so the window rolls
  // forward when the app stays open across midnight — refresh() is called
  // on every focus and re-anchors the day.
  const [todayStr, setTodayStr] = useState(() => formatDateString(new Date()));

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [outfitDates, setOutfitDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Generate 10-day rolling window (3 past, today, 6 future)
  const dateWindow = useMemo(() => {
    const dates: Date[] = [];
    const base = new Date();
    // 3 days back
    for (let i = -3; i <= 6; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(d);
    }
    return dates;
    // todayStr re-anchors the window when the day changes
  }, [todayStr]);

  const startDateStr = useMemo(() => formatDateString(dateWindow[0]), [dateWindow]);
  const endDateStr = useMemo(() => formatDateString(dateWindow[dateWindow.length - 1]), [dateWindow]);

  const fetchCalendar = useCallback(async () => {
    // Re-anchor "today" first — same value is a no-op, a new day rolls
    // the window forward and refetches with the shifted range.
    setTodayStr(formatDateString(new Date()));
    setLoading(true);
    try {
      const data = await fetchOutfitCalendar(startDateStr, endDateStr);
      const set = new Set<string>();
      for (const item of data) {
        if (item.has_outfit) {
          set.add(item.date);
        }
      }
      setOutfitDates(set);
    } catch {
      // Best-effort fallback on network error
    } finally {
      setLoading(false);
    }
  }, [startDateStr, endDateStr]);

  useEffect(() => {
    void fetchCalendar();
  }, [fetchCalendar]);

  const selectDate = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
  }, []);

  // Compute final day objects
  const days: CalendarDay[] = useMemo(() => {
    return dateWindow.map((d) => {
      const dStr = formatDateString(d);
      const isToday = dStr === todayStr;
      const isPast = dStr < todayStr;
      const isSelected = dStr === selectedDate;
      const hasOutfit = outfitDates.has(dStr);

      return {
        date: dStr,
        dayNum: d.getDate(),
        weekday: WEEKDAYS[d.getDay()],
        hasOutfit,
        isPast,
        isToday,
        isSelected,
      };
    });
  }, [dateWindow, todayStr, selectedDate, outfitDates]);

  const selectedDayObj = useMemo(
    () => days.find((d) => d.date === selectedDate) || null,
    [days, selectedDate],
  );

  return {
    days,
    selectedDate,
    selectedDayObj,
    selectDate,
    refresh: fetchCalendar,
    loading,
    todayIndex: 3, // Index 3 is Today in 0-indexed array (-3, -2, -1, 0, 1, 2, 3, 4, 5, 6)
  };
}
