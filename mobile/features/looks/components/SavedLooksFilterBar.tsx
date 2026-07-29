import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
            color={selectedFilter ? colors.surface : "#1A1A1A"}
          />
          <Text style={[styles.filterBtnText, Boolean(selectedFilter) && styles.filterBtnTextActive]}>
            Filter
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Filter Chips (Collapsible or persistent) */}
      {(showFilterChips || Boolean(selectedFilter)) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
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
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    height: 48,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  filterBtnActive: {
    backgroundColor: "#1A1A1A",
    borderColor: "#1A1A1A",
  },
  filterBtnText: {
    ...typography.button,
    fontSize: 14,
    color: "#1A1A1A",
  },
  filterBtnTextActive: {
    color: colors.surface,
  },
  filterChipsScroll: {
    gap: spacing.xs,
    paddingVertical: 4,
  },
  chip: {
    backgroundColor: "#F4F1EA",
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  chipActive: {
    backgroundColor: "#1A1A1A",
  },
  chipText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  chipTextActive: {
    color: colors.surface,
  },
});
