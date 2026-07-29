import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface SizeOption {
  label: string;
  value: string;
}

interface SizeMultiSelectionModalProps {
  visible: boolean;
  title: string;
  options: SizeOption[];
  selectedValues: string | string[];
  maxSelections?: number;
  onSave: (sizes: string[]) => void;
  onClose: () => void;
}

export function SizeMultiSelectionModal({
  visible,
  title,
  options,
  selectedValues,
  maxSelections = 2,
  onSave,
  onClose,
}: SizeMultiSelectionModalProps) {
  const parseInitial = (): string[] => {
    if (Array.isArray(selectedValues)) return selectedValues;
    if (typeof selectedValues === "string" && selectedValues.trim().length > 0) {
      return selectedValues.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const [currentSelected, setCurrentSelected] = useState<string[]>(parseInitial());

  useEffect(() => {
    if (visible) {
      setCurrentSelected(parseInitial());
    }
  }, [visible, selectedValues]);

  const handleToggle = (val: string) => {
    if (currentSelected.includes(val)) {
      setCurrentSelected((prev) => prev.filter((item) => item !== val));
    } else {
      if (currentSelected.length >= maxSelections) {
        Alert.alert(
          "Maximum 2 Sizes",
          `You can select up to ${maxSelections} sizes (e.g. S and M for different brand fits).`,
        );
        return;
      }
      setCurrentSelected((prev) => [...prev, val]);
    }
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
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>
                Select up to {maxSelections} sizes for different brand fits.
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {/* Size Options Grid */}
          <ScrollView
            contentContainerStyle={styles.optionsList}
            showsVerticalScrollIndicator={false}
          >
            {options.map((opt) => {
              const active = currentSelected.includes(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleToggle(opt.value)}
                  style={[styles.optionRow, active && styles.optionRowActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                    {opt.label}
                  </Text>

                  {active && (
                    <Ionicons name="checkmark-circle" size={20} color="#1A1A1A" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>
                Save Selected Sizes ({currentSelected.length}/{maxSelections})
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
    maxHeight: "75%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
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
  optionsList: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: "#F8F6F0",
  },
  optionRowActive: {
    backgroundColor: "#EFECE6",
  },
  optionLabel: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  optionLabelActive: {
    fontWeight: "700",
    color: "#000000",
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
