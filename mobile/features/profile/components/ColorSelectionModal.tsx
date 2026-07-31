import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MAIN_COLOR_OPTIONS, PREDEFINED_SHADES_CATEGORIES } from "@/features/onboarding/config";
import { resolveColorHex } from "@/features/profile/utils/preferenceUtils";
import { colors, radius, spacing, typography } from "@/theme";

interface ColorSelectionModalProps {
  visible: boolean;
  selectedColors: string[];
  onSave: (colors: string[]) => void;
  onClose: () => void;
}

export function ColorSelectionModal({
  visible,
  selectedColors,
  onSave,
  onClose,
}: ColorSelectionModalProps) {
  const [currentSelected, setCurrentSelected] = useState<string[]>(() =>
    (selectedColors || []).map((c) => resolveColorHex(c)),
  );

  // Synchronize when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentSelected((selectedColors || []).map((c) => resolveColorHex(c)));
    }
  }, [visible, selectedColors]);

  const handleToggleColor = (hex: string) => {
    setCurrentSelected((prev) => {
      const normalizedHex = resolveColorHex(hex);
      if (prev.includes(normalizedHex)) {
        return prev.filter((c) => c !== normalizedHex);
      }
      return [...prev, normalizedHex];
    });
  };

  const handleSave = () => {
    onSave(currentSelected);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select Favourite Colours</Text>
              <Text style={styles.subtitle}>
                Choose from 80+ basic colours and fashion shades.
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {/* Color Palette List */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Basic Main Colours Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>BASIC COLOURS</Text>
              <View style={styles.colorGrid}>
                {MAIN_COLOR_OPTIONS.map((item) => {
                  const active = currentSelected.includes(item.hex);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleToggleColor(item.hex)}
                      style={[
                        styles.colorChip,
                        active && styles.colorChipActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.colorCircle,
                          { backgroundColor: item.hex },
                          item.hex === "#FFFFFF" && styles.whiteBorder,
                        ]}
                      >
                        {active && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={item.hex === "#FFFFFF" ? "#000000" : "#FFFFFF"}
                          />
                        )}
                      </View>
                      <Text style={styles.colorName}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Predefined Shades Categories (Whites, Blues, Greens, Reds, etc.) */}
            {PREDEFINED_SHADES_CATEGORIES.map((catGroup) => (
              <View key={catGroup.category} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {catGroup.category.toUpperCase()} SHADES
                </Text>
                <View style={styles.colorGrid}>
                  {catGroup.shades.map((shade) => {
                    const active = currentSelected.includes(shade.hex);
                    return (
                      <TouchableOpacity
                        key={shade.id}
                        onPress={() => handleToggleColor(shade.hex)}
                        style={[
                          styles.colorChip,
                          active && styles.colorChipActive,
                        ]}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.colorCircle,
                            { backgroundColor: shade.hex },
                            (shade.hex === "#FFFFFF" || shade.hex.toLowerCase() === "#ffffff00" || shade.borderColor) &&
                              styles.whiteBorder,
                          ]}
                        >
                          {active && (
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color={
                                shade.hex === "#FFFFFF" ||
                                shade.hex === "#FFFDD0" ||
                                shade.hex === "#FFFFF0" ||
                                shade.hex === "#FAF9F6" ||
                                shade.hex === "#F0EAD6"
                                  ? "#000000"
                                  : "#FFFFFF"
                              }
                            />
                          )}
                        </View>
                        <Text style={styles.colorName}>{shade.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>
                Save Selected Colours ({currentSelected.length})
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 12,
    color: "#7F7C76",
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  colorChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8F6F0",
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  colorChipActive: {
    backgroundColor: "#EFECE6",
    borderColor: "#1A1A1A",
  },
  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  whiteBorder: {
    borderWidth: 1,
    borderColor: "#DCD8CE",
  },
  colorName: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  footer: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#EFECE6",
  },
  saveBtn: {
    backgroundColor: "#1A1A1A",
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
    ...typography.button,
    color: colors.surface,
    fontSize: 15,
  },
});
