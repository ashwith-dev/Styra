import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface SavedLooksFilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
}

export const FILTER_OPTIONS = [
  "Casual",
  "Formal",
  "Minimal",
  "Streetwear",
  "College",
  "Office",
  "Party",
  "Outdoor",
  "Summer",
  "Winter",
];

export function SavedLooksFilterBar({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterSelect,
}: SavedLooksFilterBarProps) {
  const [showFilterChips, setShowFilterChips] = useState(false);

  return (
    <View style={styles.container}>
      {/* Search Input + Filter Button Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search-outline" size={18} color="#7F7C76" style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search saved looks..."
            placeholderTextColor="#99958F"
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search saved looks"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={16} color="#7F7C76" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setShowFilterChips((prev) => !prev)}
          style={[styles.filterBtn, Boolean(selectedFilter) && styles.filterBtnActive]}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Filter looks"
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={selectedFilter ? "#FFFFFF" : colors.textPrimary}
          />
          <Text style={[styles.filterBtnText, Boolean(selectedFilter) && styles.filterBtnTextActive]}>
            Filter
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Filter Chips */}
      {(showFilterChips || Boolean(selectedFilter)) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterChipsScroll}
        >
          <TouchableOpacity
            onPress={() => onFilterSelect("")}
            style={[styles.chip, !selectedFilter && styles.chipActive]}
          >
            <Text style={[styles.chipText, !selectedFilter && styles.chipTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          {FILTER_OPTIONS.map((opt) => {
            const isActive = selectedFilter.toLowerCase() === opt.toLowerCase();
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => onFilterSelect(isActive ? "" : opt)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  searchRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2EFE8",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    boxShadow: "inset 2px 2px 5px rgba(185, 175, 158, 0.5), inset -2px -2px 5px #FFFFFF",
  } as ViewStyle & { boxShadow?: string },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    height: "100%",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F7F5F0",
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    height: 48,
    borderWidth: 0,
    boxShadow: "-4px -4px 10px #FFFFFF, 4px 4px 10px rgba(185, 175, 158, 0.55)",
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle & { boxShadow?: string },
  filterBtnActive: {
    backgroundColor: "#141412",
    boxShadow: "0px 6px 16px rgba(20, 20, 18, 0.3)",
  } as ViewStyle & { boxShadow?: string },
  filterBtnText: {
    ...typography.button,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  filterBtnTextActive: {
    color: "#FFFFFF",
  },
  filterScrollView: {
    overflow: "visible",
  },
  filterChipsScroll: {
    gap: spacing.xs,
    paddingVertical: 10,
    overflow: "visible",
  },
  chip: {
    backgroundColor: "#F7F5F0",
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderWidth: 0,
    boxShadow: "-3px -3px 8px #FFFFFF, 3px 3px 8px rgba(185, 175, 158, 0.5)",
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  } as ViewStyle & { boxShadow?: string },
  chipActive: {
    backgroundColor: "#141412",
    boxShadow: "0px 4px 12px rgba(20, 20, 18, 0.25)",
  } as ViewStyle & { boxShadow?: string },
  chipText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
});
