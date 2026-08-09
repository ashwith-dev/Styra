/**
 * useTodayOutfit.ts
 *
 * Persists the outfit the user marked as "Worn Today" to AsyncStorage.
 * The entry is date-keyed so it auto-expires at midnight.
 */

import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OutfitItemResponse } from "@/lib/types";
import { formatDateString } from "@/hooks/useOutfitCalendar";

export interface TodayOutfitData {
  date: string; // "YYYY-MM-DD"
  items: OutfitItemResponse[];
  score: number;
  reason: string;
  occasion?: string;
  style?: string;
}

export const STORAGE_KEY = "today_outfit_v1";
const STORAGE_PREFIX = "outfit_date_v1_";

export function todayString(): string {
  return formatDateString(new Date());
}

export function getStorageKeyForDate(dateStr: string): string {
  return `${STORAGE_PREFIX}${dateStr}`;
}

export function useTodayOutfit() {
  const [todayOutfit, setTodayOutfit] = useState<TodayOutfitData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const key = getStorageKeyForDate(todayString());
      let raw = await AsyncStorage.getItem(key);
      if (!raw) {
        raw = await AsyncStorage.getItem(STORAGE_KEY);
      }
      if (!raw) return;
      const parsed: TodayOutfitData = JSON.parse(raw);
      if (parsed.date === todayString()) {
        setTodayOutfit(parsed);
      }
    } catch {
      // ignore parse errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const getOutfitForDate = useCallback(async (dateStr: string): Promise<TodayOutfitData | null> => {
    try {
      const key = getStorageKeyForDate(dateStr);
      let raw = await AsyncStorage.getItem(key);
      if (!raw && dateStr === todayString()) {
        raw = await AsyncStorage.getItem(STORAGE_KEY);
      }
      if (!raw) return null;
      return JSON.parse(raw) as TodayOutfitData;
    } catch {
      return null;
    }
  }, []);

  const saveTodayOutfit = useCallback(async (data: Omit<TodayOutfitData, "date">, targetDate: string = todayString()) => {
    const entry: TodayOutfitData = { ...data, date: targetDate };
    if (targetDate === todayString()) {
      setTodayOutfit(entry);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    }
    await AsyncStorage.setItem(getStorageKeyForDate(targetDate), JSON.stringify(entry));
  }, []);

  const clearTodayOutfit = useCallback(async (targetDate: string = todayString()) => {
    if (targetDate === todayString()) {
      setTodayOutfit(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
    await AsyncStorage.removeItem(getStorageKeyForDate(targetDate));
  }, []);

  return {
    todayOutfit,
    loading,
    saveTodayOutfit,
    clearTodayOutfit,
    getOutfitForDate,
    reload: load,
  };
}
