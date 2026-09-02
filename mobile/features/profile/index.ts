export { DEFAULT_PREFERENCES, SETTINGS_SECTIONS, EXTERNAL_LINKS } from "./config";
export type {
  PreferenceState,
  ProfileUser,
  UserPreferences,
  BodyProfile,
  ProfileActions,
  ProfileViewModel,
  SettingsItemConfig,
  SettingsSectionConfig,
  EditProfileModalProps,
} from "./types/profile";
export { useProfileData } from "./hooks/useProfileData";

export { EditProfileModal } from "./components/EditProfileModal";
export { ProfileHeaderCard } from "./components/ProfileHeaderCard";
export { ProfileStatsRow } from "./components/ProfileStatsRow";
export { SettingsSectionList } from "./components/SettingsSectionList";

export { ProfileTopHeader, StickySettingsButton } from "./components/ProfileTopHeader";
export { ProfileHeroCard } from "./components/ProfileHeroCard";
export { WardrobeSummaryCard } from "./components/WardrobeSummaryCard";
export { AiStyleProfileSection } from "./components/AiStyleProfileSection";
export { BodyProfileSection } from "./components/BodyProfileSection";
export { WardrobeInsightsSection } from "./components/WardrobeInsightsSection";
export { AppPreferencesSection } from "./components/AppPreferencesSection";
export { SelectionModal } from "./components/SelectionModal";
export { ColorSelectionModal } from "./components/ColorSelectionModal";
export { HeightWeightRulerModal } from "./components/HeightWeightRulerModal";
export { SizeMultiSelectionModal } from "./components/SizeMultiSelectionModal";
export { formatPreferenceLabel, resolveColorHex } from "./utils/preferenceUtils";

