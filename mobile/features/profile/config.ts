import type {
  SettingsSectionConfig,
  UserPreferences,
} from "./types/profile";

export const DEFAULT_PREFERENCES: UserPreferences = {
  wardrobeType: "mixed",
  styles: [],
  favoriteColors: [],
  fitPreference: "",
  lifestyle: "",
  smartNotifications: true,
  bodyProfile: {
    height: "",
    weight: "",
    topSize: "",
    bottomSize: "",
    shoeSize: "",
    gender: "",
  },
  temperatureUnit: "Celsius (°C)",
  notifications: {
    outfits: true,
    wardrobe: true,
    general: true,
  },
  theme: "system",
  language: "English",
  units: "metric",
};

export const EXTERNAL_LINKS = {
  privacyPolicy: "https://example.com/privacy",
  termsConditions: "https://example.com/terms",
  helpCenter: "https://example.com/help",
  supportContact: "mailto:support@styra.app",
  sendFeedback: "mailto:feedback@styra.app",
};

export const SETTINGS_SECTIONS: SettingsSectionConfig[] = [
  {
    title: "Notifications",
    items: [
      {
        key: "notif_outfits",
        label: "Outfit Recommendations",
        type: "toggle",
        valueKey: "outfits",
      },
      {
        key: "notif_wardrobe",
        label: "Wardrobe Reminders",
        type: "toggle",
        valueKey: "wardrobe",
      },
      {
        key: "notif_general",
        label: "General Updates",
        type: "toggle",
        valueKey: "general",
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      {
        key: "pref_theme",
        label: "Theme",
        type: "value",
        valueKey: "theme",
        placeholder: true,
      },
      {
        key: "pref_language",
        label: "Language",
        type: "value",
        valueKey: "language",
        placeholder: true,
      },
      {
        key: "pref_units",
        label: "Units",
        type: "value",
        valueKey: "units",
        placeholder: true,
      },
    ],
  },
  {
    title: "Privacy & Security",
    items: [
      {
        key: "privacy_policy",
        label: "Privacy Policy",
        type: "link",
        linkUrl: EXTERNAL_LINKS.privacyPolicy,
      },
      {
        key: "terms_conditions",
        label: "Terms & Conditions",
        type: "link",
        linkUrl: EXTERNAL_LINKS.termsConditions,
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        key: "help_center",
        label: "Help & FAQ",
        type: "link",
        linkUrl: EXTERNAL_LINKS.helpCenter,
      },
      {
        key: "contact_support",
        label: "Contact Support",
        type: "link",
        linkUrl: EXTERNAL_LINKS.supportContact,
      },
      {
        key: "send_feedback",
        label: "Send Feedback",
        type: "link",
        linkUrl: EXTERNAL_LINKS.sendFeedback,
      },
    ],
  },
];
