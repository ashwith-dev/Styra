import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface HeightWeightRulerModalProps {
  visible: boolean;
  type: "height" | "weight";
  currentValue: string;
  onSave: (val: string) => void;
  onClose: () => void;
}

const ITEM_SIZE = 54;

export function HeightWeightRulerModal({
  visible,
  type,
  currentValue,
  onSave,
  onClose,
}: HeightWeightRulerModalProps) {
  const isHeight = type === "height";
  const minVal = 0;
  const maxVal = isHeight ? 250 : 150;
  const unit = isHeight ? "cm" : "kg";

  // Generate range items: 0 to 250 (height) or 0 to 150 (weight)
  const rangeValues = Array.from({ length: maxVal - minVal + 1 }, (_, i) => minVal + i);

  // Parse initial numeric value
  const parseNum = (valStr: string) => {
    const num = parseInt(valStr.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(num) && num >= minVal && num <= maxVal) {
      return num;
    }
    return isHeight ? 175 : 68;
  };

  const [selectedValue, setSelectedValue] = useState<number>(parseNum(currentValue));
  const flatListRef = useRef<FlatList<number>>(null);

  const scrollToIndex = (val: number, animated = true) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    const index = clamped - minVal;
    if (index >= 0 && index < rangeValues.length) {
      setSelectedValue(clamped);
      flatListRef.current?.scrollToIndex({ index, animated });
    }
  };

  useEffect(() => {
    if (visible) {
      const initialNum = parseNum(currentValue);
      setSelectedValue(initialNum);

      // Scroll to initial index after render
      setTimeout(() => {
        const index = initialNum - minVal;
        if (index >= 0 && index < rangeValues.length) {
          flatListRef.current?.scrollToIndex({ index, animated: false });
        }
      }, 120);
    }
  }, [visible, currentValue]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    const index = Math.round(offset / ITEM_SIZE);
    if (index >= 0 && index < rangeValues.length) {
      const val = rangeValues[index];
      if (val !== selectedValue) {
        setSelectedValue(val);
      }
    }
  };

  const handleSave = () => {
    onSave(`${selectedValue} ${unit}`);
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
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Select {isHeight ? "Height (0-250 cm)" : "Weight (0-150 kg)"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {/* Prominent Large Display */}
          <View style={styles.displayWrapper}>
            <Text style={styles.numberDisplay}>{selectedValue}</Text>
            <Text style={styles.unitDisplay}>{unit}</Text>
          </View>

          {/* iOS Style Wheel Scroll Picker */}
          <View style={styles.wheelContainer}>
            {/* Center Selection Indicator Highlight Bar */}
            <View style={styles.selectionHighlight} pointerEvents="none" />

            <FlatList
              ref={flatListRef}
              data={rangeValues}
              keyExtractor={(item) => String(item)}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_SIZE}
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
              getItemLayout={(_, index) => ({
                length: ITEM_SIZE,
                offset: ITEM_SIZE * index,
                index,
              })}
              contentContainerStyle={{
                paddingVertical: ITEM_SIZE * 2,
              }}
              renderItem={({ item }) => {
                const isSelected = item === selectedValue;
                return (
                  <TouchableOpacity
                    onPress={() => scrollToIndex(item, true)}
                    activeOpacity={0.8}
                    style={styles.itemRow}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        isSelected && styles.itemTextSelected,
                      ]}
                    >
                      {item} <Text style={styles.itemUnit}>{unit}</Text>
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Footer Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Save {selectedValue} {unit}</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    fontSize: 17,
    color: colors.textPrimary,
  },
  displayWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginVertical: spacing.md,
    justifyContent: "center",
  },
  numberDisplay: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 48,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  unitDisplay: {
    ...typography.body,
    fontSize: 20,
    fontWeight: "600",
    color: "#7F7C76",
  },
  wheelContainer: {
    height: ITEM_SIZE * 5,
    width: "100%",
    position: "relative",
    marginBottom: spacing.xl,
  },
  selectionHighlight: {
    position: "absolute",
    top: ITEM_SIZE * 2,
    left: 0,
    right: 0,
    height: ITEM_SIZE,
    backgroundColor: "#F4F1EA",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#E5E1D8",
  },
  itemRow: {
    height: ITEM_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 20,
    color: "#A09C94",
  },
  itemTextSelected: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  itemUnit: {
    fontSize: 14,
    fontWeight: "400",
  },
  saveBtn: {
    width: "100%",
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
