import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavBar } from "@/components/ui";
import { colors, spacing } from "@/theme";
import {
  AiStyleProfileSection,
  AppPreferencesSection,
  BodyProfile,
  BodyProfileSection,
  ColorSelectionModal,
  EditProfileModal,
  HeightWeightRulerModal,
  ProfileHeroCard,
  ProfileTopHeader,
  SelectionModal,
  SizeMultiSelectionModal,
  useProfileData,
  WardrobeInsightsSection,
  WardrobeSummaryCard,
} from "@/features/profile";

export default function ProfileScreen() {
  const { user, preferences, stats, insights, actions } = useProfileData();

  // Modals state
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatarUrl ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Ruler Modal state (Height & Weight)
  const [rulerModalConfig, setRulerModalConfig] = useState<{
    visible: boolean;
    type: "height" | "weight";
    currentValue: string;
  }>({
    visible: false,
    type: "height",
    currentValue: "",
  });

  // Size Multi-Selection Modal state (Top Size, Bottom Size, Shoe Size)
  const [sizeModalConfig, setSizeModalConfig] = useState<{
    visible: boolean;
    title: string;
    key: "topSize" | "bottomSize" | "shoeSize";
    options: { label: string; value: string }[];
    selectedValues: string | string[];
  }>({
    visible: false,
    title: "",
    key: "topSize",
    options: [],
    selectedValues: [],
  });

  // Standard Selection modal state
  const [selectionModalConfig, setSelectionModalConfig] = useState<{
    visible: boolean;
    title: string;
    key: string;
    options: { label: string; value: string }[];
    selectedValue: string | string[];
    isMultiSelect?: boolean;
  }>({
    visible: false,
    title: "",
    key: "",
    options: [],
    selectedValue: "",
  });

  // Handle Edit Profile modal save
  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    const success = await actions.updateProfile({
      name: editName,
      avatarUrl: editAvatarUrl,
    });
    setSavingProfile(false);
    if (success) {
      setEditProfileVisible(false);
    }
  }, [editName, editAvatarUrl, actions]);

  // Handle saving colors from ColorSelectionModal
  const handleSaveColors = useCallback(
    (colorsList: string[]) => {
      void actions.updatePreferences({
        favoriteColors: colorsList,
      });
    },
    [actions],
  );

  // Handle saving Height or Weight from Ruler Modal
  const handleSaveRulerValue = useCallback(
    (val: string) => {
      const field = rulerModalConfig.type;
      void actions.updatePreferences({
        bodyProfile: {
          ...preferences.bodyProfile,
          [field]: val,
        },
      });
    },
    [rulerModalConfig.type, preferences.bodyProfile, actions],
  );

  // Handle saving Sizes from SizeMultiSelectionModal (up to 2 sizes)
  const handleSaveSizes = useCallback(
    (sizes: string[]) => {
      const field = sizeModalConfig.key;
      void actions.updatePreferences({
        bodyProfile: {
          ...preferences.bodyProfile,
          [field]: sizes,
        },
      });
    },
    [sizeModalConfig.key, preferences.bodyProfile, actions],
  );

  // Open Selection Modal or Color/Ruler/Size Modal for AI Style or Body Profile fields
  const handleOpenSelectionModal = useCallback(
    (fieldKey: string) => {
      if (fieldKey === "favoriteColors") {
        setColorModalVisible(true);
        return;
      }

      if (fieldKey === "height" || fieldKey === "weight") {
        setRulerModalConfig({
          visible: true,
          type: fieldKey as "height" | "weight",
          currentValue: (preferences.bodyProfile[fieldKey as "height" | "weight"] as string) || "",
        });
        return;
      }

      if (fieldKey === "topSize") {
        setSizeModalConfig({
          visible: true,
          title: "Select Top Size (Up to 2)",
          key: "topSize",
          options: [
            { label: "XS", value: "XS" },
            { label: "S", value: "S" },
            { label: "M", value: "M" },
            { label: "L", value: "L" },
            { label: "XL", value: "XL" },
            { label: "XXL", value: "XXL" },
          ],
          selectedValues: preferences.bodyProfile.topSize || [],
        });
        return;
      }

      if (fieldKey === "bottomSize") {
        setSizeModalConfig({
          visible: true,
          title: "Select Bottom Size (Up to 2)",
          key: "bottomSize",
          options: [
            { label: "26", value: "26" },
            { label: "28", value: "28" },
            { label: "30", value: "30" },
            { label: "32", value: "32" },
            { label: "34", value: "34" },
            { label: "36", value: "36" },
            { label: "38", value: "38" },
          ],
          selectedValues: preferences.bodyProfile.bottomSize || [],
        });
        return;
      }

      if (fieldKey === "shoeSize") {
        setSizeModalConfig({
          visible: true,
          title: "Select Shoe Size (Up to 2)",
          key: "shoeSize",
          options: [
            { label: "6 (UK)", value: "6 (UK)" },
            { label: "7 (UK)", value: "7 (UK)" },
            { label: "8 (UK)", value: "8 (UK)" },
            { label: "9 (UK)", value: "9 (UK)" },
            { label: "10 (UK)", value: "10 (UK)" },
            { label: "11 (UK)", value: "11 (UK)" },
            { label: "12 (UK)", value: "12 (UK)" },
          ],
          selectedValues: preferences.bodyProfile.shoeSize || [],
        });
        return;
      }

      switch (fieldKey) {
        case "styles":
          setSelectionModalConfig({
            visible: true,
            title: "Select Preferred Styles",
            key: "styles",
            options: [
              { label: "Minimal", value: "Minimal" },
              { label: "Smart Casual", value: "Smart Casual" },
              { label: "Classic", value: "Classic" },
              { label: "Streetwear", value: "Streetwear" },
              { label: "Formal", value: "Formal" },
              { label: "Bohemian", value: "Bohemian" },
              { label: "Elegant", value: "Elegant" },
              { label: "Sporty", value: "Sporty" },
              { label: "Everyday", value: "Everyday" },
            ],
            selectedValue: preferences.styles || [],
            isMultiSelect: true,
          });
          break;

        case "fitPreference":
          setSelectionModalConfig({
            visible: true,
            title: "Select Fit Preference",
            key: "fitPreference",
            options: [
              { label: "Slim", value: "Slim" },
              { label: "Regular", value: "Regular" },
              { label: "Relaxed", value: "Relaxed" },
              { label: "Oversized", value: "Oversized" },
            ],
            selectedValue: preferences.fitPreference,
          });
          break;

        case "lifestyle":
          setSelectionModalConfig({
            visible: true,
            title: "Select Lifestyle",
            key: "lifestyle",
            options: [
              { label: "Casual", value: "Casual" },
              { label: "College", value: "College" },
              { label: "Office", value: "Office" },
              { label: "Travel", value: "Travel" },
              { label: "Active", value: "Active" },
            ],
            selectedValue: preferences.lifestyle,
          });
          break;

        case "gender":
          setSelectionModalConfig({
            visible: true,
            title: "Select Gender",
            key: "bodyProfile.gender",
            options: [
              { label: "Female", value: "Female" },
              { label: "Male", value: "Male" },
              { label: "Non-binary", value: "Non-binary" },
              { label: "Prefer not to say", value: "Prefer not to say" },
            ],
            selectedValue: preferences.bodyProfile.gender,
          });
          break;

        case "temperatureUnit":
          setSelectionModalConfig({
            visible: true,
            title: "Select Temperature Unit",
            key: "temperatureUnit",
            options: [
              { label: "Celsius (°C)", value: "Celsius (°C)" },
              { label: "Fahrenheit (°F)", value: "Fahrenheit (°F)" },
            ],
            selectedValue: preferences.temperatureUnit,
          });
          break;
      }
    },
    [preferences],
  );

  // Apply selected option instantly and persist
  const handleSelectOption = useCallback(
    (selectedValue: string) => {
      const key = selectionModalConfig.key;

      if (key.startsWith("bodyProfile.")) {
        const bodyField = key.split(".")[1] as keyof BodyProfile;
        void actions.updatePreferences({
          bodyProfile: {
            ...preferences.bodyProfile,
            [bodyField]: selectedValue,
          },
        });
      } else if (key === "styles") {
        const currentList = preferences.styles || [];
        const updatedList = currentList.includes(selectedValue)
          ? currentList.filter((item) => item !== selectedValue)
          : [...currentList, selectedValue];

        void actions.updatePreferences({
          styles: updatedList,
        });

        setSelectionModalConfig((prev) => ({
          ...prev,
          selectedValue: updatedList,
        }));
        return;
      } else {
        void actions.updatePreferences({
          [key]: selectedValue,
        });
      }

      setSelectionModalConfig((prev) => ({ ...prev, visible: false }));
    },
    [selectionModalConfig.key, preferences, actions],
  );

  const handleToggleSmartNotifications = useCallback(
    (val: boolean) => {
      void actions.updatePreferences({ smartNotifications: val });
    },
    [actions],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Top Header: STYRA Logo + Settings Button */}
        <ProfileTopHeader />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Hero Card (Avatar, Name, Email, Edit Button) */}
          <ProfileHeroCard
            user={user}
            onEditProfile={() => {
              setEditName(user.name);
              setEditAvatarUrl(user.avatarUrl ?? "");
              setEditProfileVisible(true);
            }}
          />

          {/* Wardrobe Summary Card */}
          <WardrobeSummaryCard stats={stats} />

          {/* AI Style Profile Section */}
          <AiStyleProfileSection
            preferences={preferences}
            onEditSection={handleOpenSelectionModal}
            onToggleNotification={handleToggleSmartNotifications}
          />

          {/* Body Profile Section */}
          <BodyProfileSection
            bodyProfile={preferences.bodyProfile}
            onEditField={(fieldKey) => handleOpenSelectionModal(fieldKey)}
          />

          {/* Wardrobe Insights Section */}
          <WardrobeInsightsSection
            insights={insights}
            totalItems={stats.totalItems}
            savedLooksCount={stats.savedLooksCount}
          />

          {/* App Preferences Section */}
          <AppPreferencesSection
            temperatureUnit={preferences.temperatureUnit}
            onEditTemperature={() => handleOpenSelectionModal("temperatureUnit")}
          />
        </ScrollView>

        {/* Floating Bottom Navigation Bar */}
        <BottomNavBar activeTab="profile" />
      </View>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editProfileVisible}
        name={editName}
        avatarUrl={editAvatarUrl}
        saving={savingProfile}
        onChangeName={setEditName}
        onChangeAvatarUrl={setEditAvatarUrl}
        onSave={handleSaveProfile}
        onClose={() => setEditProfileVisible(false)}
      />

      {/* Full Color Selection Modal with 80 Shades */}
      <ColorSelectionModal
        visible={colorModalVisible}
        selectedColors={preferences.favoriteColors || []}
        onSave={handleSaveColors}
        onClose={() => setColorModalVisible(false)}
      />

      {/* Height & Weight iOS Style Ruler Scroll Picker Modal */}
      <HeightWeightRulerModal
        visible={rulerModalConfig.visible}
        type={rulerModalConfig.type}
        currentValue={rulerModalConfig.currentValue}
        onSave={handleSaveRulerValue}
        onClose={() => setRulerModalConfig((prev) => ({ ...prev, visible: false }))}
      />

      {/* Size Multi-Selection Modal (Up to 2 sizes) */}
      <SizeMultiSelectionModal
        visible={sizeModalConfig.visible}
        title={sizeModalConfig.title}
        options={sizeModalConfig.options}
        selectedValues={sizeModalConfig.selectedValues}
        maxSelections={2}
        onSave={handleSaveSizes}
        onClose={() => setSizeModalConfig((prev) => ({ ...prev, visible: false }))}
      />

      {/* Standard Option Selection Modal */}
      <SelectionModal
        visible={selectionModalConfig.visible}
        title={selectionModalConfig.title}
        options={selectionModalConfig.options}
        selectedValue={selectionModalConfig.selectedValue}
        isMultiSelect={selectionModalConfig.isMultiSelect}
        onSelect={handleSelectOption}
        onClose={() =>
          setSelectionModalConfig((prev) => ({ ...prev, visible: false }))
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    position: "relative",
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: 120,
  },
});
