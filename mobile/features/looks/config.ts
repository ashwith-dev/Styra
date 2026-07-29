export const LOOK_CATEGORIES = [
  "Casual",
  "Formal",
  "Workwear",
  "Evening",
  "Party",
  "Sportswear",
  "Loungewear",
  "Other",
] as const;

export const LOOK_SEASONS = [
  "All Seasons",
  "Spring",
  "Summer",
  "Autumn",
  "Winter",
] as const;

export const LOOK_CONFIG = {
  minItemsPerLook: 1,
  maxItemsPerLook: 8,
  defaultCategory: "Casual",
  defaultSeason: "All Seasons",
};
