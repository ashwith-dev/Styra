import type { ClothingItemBrief } from "@/lib/types";
import type { WeatherData } from "@/lib/services/weatherService";

export type { WeatherData };

export interface HomeHeaderProps {
  userName?: string | null;
  userAvatar?: string | null;
  greetingTime: string;
  onSignOut?: () => void;
  /** Live temperature display string, e.g. "29°C" */
  liveTemp?: string | null;
  /** User's fit preference to show in context tag (e.g. "SLIM", "REGULAR", "OVERSIZED") */
  userFitPreference?: string | null;
  /** User's lifestyle preference to show in context tag (legacy/fallback) */
  userLifestyle?: string | null;
  /** Called when user taps the context tag (temp/fit row) */
  onContextTagPress?: () => void;
}

export interface HomeQuickActionsProps {
  onAddClothing: () => void;
  onGenerateOutfit: () => void;
  hasOutfitForSelectedDate?: boolean;
  onViewOutfit?: () => void;
}



export interface HomeWardrobeStatsProps {
  totalItems: number;
  categoryCount: number;
  savedOutfitsCount: number;
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
  /** Live weather from Open-Meteo. When present, overrides the static weather config */
  liveWeather?: WeatherData | null;
  /** Whether weather is currently being fetched */
  isLoadingWeather?: boolean;
  /** Called when the user taps the weather card to trigger location permission + fetch */
  onWeatherCardPress?: () => void;
}

