import type { SavedLook } from "../types/looks";

export interface GroupedLooks {
  title: string;
  data: SavedLook[];
}

export function groupLooksByDate(looks: SavedLook[]): GroupedLooks[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const todayList: SavedLook[] = [];
  const yesterdayList: SavedLook[] = [];
  const earlierThisWeekList: SavedLook[] = [];
  const lastWeekList: SavedLook[] = [];

  for (const look of looks) {
    const createdDate = new Date(look.created_at || Date.now());

    if (createdDate >= todayStart) {
      todayList.push(look);
    } else if (createdDate >= yesterdayStart) {
      yesterdayList.push(look);
    } else if (createdDate >= weekStart) {
      earlierThisWeekList.push(look);
    } else {
      lastWeekList.push(look);
    }
  }

  const groups: GroupedLooks[] = [];

  if (todayList.length > 0) groups.push({ title: "TODAY", data: todayList });
  if (yesterdayList.length > 0) groups.push({ title: "YESTERDAY", data: yesterdayList });
  if (earlierThisWeekList.length > 0) groups.push({ title: "EARLIER THIS WEEK", data: earlierThisWeekList });
  if (lastWeekList.length > 0) groups.push({ title: "LAST WEEK", data: lastWeekList });

  return groups;
}

export function formatSavedTimestamp(dateStr?: string): string {
  if (!dateStr) return "SAVED TODAY";
  const date = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (date >= todayStart) {
    return `SAVED TODAY, ${timeString}`;
  } else if (date >= yesterdayStart) {
    return `SAVED YESTERDAY, ${timeString}`;
  } else {
    return `SAVED ${date.toLocaleDateString([], { month: "short", day: "numeric" }).toUpperCase()}, ${timeString}`;
  }
}
