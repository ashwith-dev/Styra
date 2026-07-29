export interface WeatherConfig {
  temp: string;
  condition: string;
  suggestion: string;
  icon: string;
}

export interface TodayOutfitConfig {
  title: string;
  subtitle: string;
  tag: string;
}

export interface AITeaserConfig {
  title: string;
  description: string;
  badge: string;
}

export interface HomeConfig {
  weather: WeatherConfig;
  todayOutfit: TodayOutfitConfig;
  aiTeaser: AITeaserConfig;
}

export const HOME_CONFIG: HomeConfig = {
  weather: {
    temp: "22°C",
    condition: "Partly Cloudy",
    suggestion: "Light outerwear or jacket recommended today.",
    icon: "partly-sunny-outline",
  },
  todayOutfit: {
    title: "Casual Layered Style",
    subtitle: "Curated for mild weather and everyday movement.",
    tag: "STYLE PREVIEW",
  },
  aiTeaser: {
    title: "AI Personal Stylist",
    description:
      "Automated outfit generation and smart recommendations are launching soon.",
    badge: "COMING SOON",
  },
};
