export type PreferenceState =
  | "idle"
  | "loading"
  | "saving"
  | "success"
  | "error";

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface BodyProfile {
  height: string;
  weight: string;
  topSize: string | string[];
  bottomSize: string | string[];
  shoeSize: string | string[];
  gender: string;
}

export interface UserPreferences {
  wardrobeType?: "men" | "women" | "mixed";
  styles: string[];
  favoriteColors: string[];
  fitPreference: string;
  lifestyle: string;
  smartNotifications: boolean;
  bodyProfile: BodyProfile;
  temperatureUnit: "Celsius (°C)" | "Fahrenheit (°F)";
  notifications: {
    outfits: boolean;
    wardrobe: boolean;
    general: boolean;
  };
  theme: "system" | "light" | "dark";
  language: string;
  units: "metric" | "imperial";
}

export interface ProfileActions {
  updateProfile: (data: {
    name?: string;
    avatarUrl?: string;
  }) => Promise<boolean>;
  updatePreferences: (
    updates: Partial<UserPreferences>,
  ) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export interface ProfileViewModel {
  user: ProfileUser;
  preferences: UserPreferences;
  stats: {
    totalItems: number;
    categoryCount: number;
    savedLooksCount: number;
    outfitsCreatedCount: number;
  };
  insights: {
    mostWorn: string;
    favColour: string;
    mostOwned: string;
    newestItem: string;
  };
  preferenceState: PreferenceState;
  error: string | null;
  actions: ProfileActions;
}

export interface SettingsItemConfig {
  key: string;
  label: string;
  type: "toggle" | "link" | "value" | "action";
  valueKey?: keyof UserPreferences["notifications"] | keyof UserPreferences;
  linkUrl?: string;
  placeholder?: boolean;
}

export interface SettingsSectionConfig {
  title: string;
  items: SettingsItemConfig[];
}

export interface EditProfileModalProps {
  visible: boolean;
  name: string;
  avatarUrl: string;
  saving: boolean;
  error?: string | null;
  onChangeName: (text: string) => void;
  onChangeAvatarUrl: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
}
