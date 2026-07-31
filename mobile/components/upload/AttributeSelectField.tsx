import { useState } from "react";
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
import { ColorSelectionModal } from "@/features/profile/components/ColorSelectionModal";
import { resolveColorHex } from "@/features/profile/utils/preferenceUtils";
import { colors, radius, spacing, typography } from "@/theme";

interface AttributeSelectFieldProps {
  label: string;
  value: string;
  options?: string[];
  type?: "select" | "color" | "text" | "tags";
  confidence?: number;
  onSelect: (val: string) => void;
  editable?: boolean;
  error?: string;
  testID?: string;
}

export function AttributeSelectField({
  label,
  value,
  options = [],
  type = "select",
  confidence,
  onSelect,
  editable = true,
  error,
  testID,
}: AttributeSelectFieldProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const showConfidence = confidence != null && confidence > 0;
  const confidencePercent = showConfidence ? Math.round(confidence * 100) : 0;

  const confidenceLabel =
    confidencePercent >= 90 ? "High" : confidencePercent >= 60 ? "Medium" : "Low";
  const confidenceColor =
    confidencePercent >= 90
      ? colors.success
      : confidencePercent >= 60
      ? colors.warning
      : colors.error;

  const handlePress = () => {
    if (!editable) return;
    setModalVisible(true);
  };

  const handleChoose = (opt: string) => {
    onSelect(opt);
    setModalVisible(false);
  };

  if (type === "color") {
    const hex = resolveColorHex(value);
    return (
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          {showConfidence && (
            <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + "20" }]}>
              <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                {confidenceLabel} {confidencePercent}%
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={styles.fieldBox}
          testID={testID}
        >
          <View style={styles.colorValueRow}>
            {value ? (
              <View style={[styles.swatchDot, { backgroundColor: hex }]} />
            ) : null}
            <Text style={styles.valueText}>{value || `Select ${label.toLowerCase()}...`}</Text>
          </View>
          <Ionicons name="chevron-down" size={18} color="#7F7C76" />
        </TouchableOpacity>

        {showConfidence && (
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${confidencePercent}%`, backgroundColor: confidenceColor },
              ]}
            />
          </View>
        )}

        <ColorSelectionModal
          visible={modalVisible}
          selectedColors={value ? [value] : []}
          onSave={(cols) => {
            if (cols.length > 0) {
              onSelect(cols[0]);
            }
          }}
          onClose={() => setModalVisible(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {showConfidence && (
          <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + "20" }]}>
            <Text style={[styles.confidenceText, { color: confidenceColor }]}>
              {confidenceLabel} {confidencePercent}%
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[styles.fieldBox, error ? styles.fieldBoxError : null]}
        testID={testID}
      >
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {value || `Select ${label.toLowerCase()}...`}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#7F7C76" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showConfidence && (
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${confidencePercent}%`, backgroundColor: confidenceColor },
            ]}
          />
        </View>
      )}

      {/* Option Selection Bottom Sheet Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.optionsList} showsVerticalScrollIndicator={false}>
              {options.map((opt) => {
                const active = value.toLowerCase() === opt.toLowerCase();
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => handleChoose(opt)}
                    style={[styles.optionRow, active && styles.optionRowActive]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                      {opt}
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={20} color="#1A1A1A" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  confidenceText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldBoxError: {
    borderColor: colors.error,
  },
  colorValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  swatchDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCD8CE",
  },
  valueText: {
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  placeholderText: {
    color: "#A09D96",
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },
  barTrack: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    marginTop: spacing.xs,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: radius.full,
  },
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
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    paddingBottom: spacing.xs,
  },
  modalTitle: {
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
