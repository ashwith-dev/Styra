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
import { colors, radius, spacing, typography } from "@/theme";

interface Option {
  label: string;
  value: string;
}

interface SelectionModalProps {
  visible: boolean;
  title: string;
  options: Option[];
  selectedValue: string | string[];
  isMultiSelect?: boolean;
  onSelect: (val: string) => void;
  onClose: () => void;
}

export function SelectionModal({
  visible,
  title,
  options,
  selectedValue,
  isMultiSelect = false,
  onSelect,
  onClose,
}: SelectionModalProps) {
  const isSelected = (val: string) => {
    if (Array.isArray(selectedValue)) {
      return selectedValue.includes(val);
    }
    return selectedValue === val;
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
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {/* Options List */}
          <ScrollView
            contentContainerStyle={styles.optionsList}
            showsVerticalScrollIndicator={false}
          >
            {options.map((opt) => {
              const active = isSelected(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => onSelect(opt.value)}
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
    paddingBottom: spacing.massive,
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
  optionsList: {
    gap: spacing.xs,
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
});
