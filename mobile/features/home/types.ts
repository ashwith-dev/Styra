import type { ClothingItemBrief } from "@/lib/types";

export interface HomeHeaderProps {
  userName?: string | null;
  userAvatar?: string | null;
  greetingTime: string;
  onSignOut?: () => void;
}

export interface HomeQuickActionsProps {
  onAddClothing: () => void;
  onViewWardrobe: () => void;
}

export interface HomeWardrobeStatsProps {
  totalItems: number;
  categoryCount: number;
  topCategory: string | null;
}

export interface RecentClothingStripProps {
  items: ClothingItemBrief[];
  onItemPress: (id: string) => void;
  onItemLongPress: (id: string) => void;
  onViewAll: () => void;
}

export interface HomePlaceholdersProps {
  weather: {
    temp: string;
    condition: string;
    suggestion: string;
    icon: string;
  };
  todayOutfit: {
    title: string;
    subtitle: string;
    tag: string;
  };
  aiTeaser: {
    title: string;
    description: string;
    badge: string;
  };
}
