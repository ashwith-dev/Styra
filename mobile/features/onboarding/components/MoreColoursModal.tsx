import { useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";
import { PREDEFINED_SHADES_CATEGORIES } from "../config";
import type { ColorOption } from "../types/onboarding";

interface MoreColoursModalProps {
  visible: boolean;
  onClose: () => void;
  selectedColors: string[];
  onToggleColor: (colorName: string) => void;
}

export function MoreColoursModal({
  visible,
  onClose,
  selectedColors,
  onToggleColor,
}: MoreColoursModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.trim().toLowerCase();

  // Filter predefined categories & shades by search query
  const filteredCategories = PREDEFINED_SHADES_CATEGORIES.map((cat) => {
    const shades = cat.shades.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        cat.category.toLowerCase().includes(query),
    );
    return { ...cat, shades };
  }).filter((cat) => cat.shades.length > 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Modal Header */}
        <View style={styles.header}>
          <Text style={styles.title}>More Colours</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
          >
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#7F7C76" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search predefined shades..."
            placeholderTextColor="#A09D96"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Categories & Shades List */}
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.category}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item: group }) => (
            <View style={styles.groupContainer}>
              <Text style={styles.groupHeader}>{group.category}</Text>
              <View style={styles.shadesGrid}>
                {group.shades.map((shade: ColorOption) => {
                  const isSelected = selectedColors.includes(shade.name);
                  return (
                    <TouchableOpacity
                      key={shade.id}
                      onPress={() => onToggleColor(shade.name)}
                      style={[
                        styles.shadeChip,
                        isSelected && styles.selectedShadeChip,
                      ]}
                      activeOpacity={0.85}
                    >
                      <View
                        style={[
                          styles.swatchDot,
                          { backgroundColor: shade.hex },
                          shade.borderColor
                            ? { borderWidth: 1, borderColor: shade.borderColor }
                            : null,
                        ]}
                      />
                      <Text style={styles.shadeName}>{shade.name}</Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={colors.textPrimary}
                          style={styles.checkIcon}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        />

        {/* Apply / Done Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.doneBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontFamily: "serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAE7E1",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.massive,
  },
  groupContainer: {
    marginTop: spacing.md,
  },
  groupHeader: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  shadesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  shadeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "#EFECE6",
    gap: spacing.xs,
  },
  selectedShadeChip: {
    borderColor: colors.textPrimary,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  swatchDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  shadeName: {
    fontFamily: "serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  checkIcon: {
    marginLeft: 2,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: "#FAF8F5",
    borderTopWidth: 1,
    borderTopColor: "#EFECE6",
  },
  doneBtn: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
  },
});
