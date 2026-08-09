/**
 * HomeQuickActions.tsx
 *
 * Premium action row for the home screen following Neumorphic hierarchy:
 * 1. Generate Outfit: Strongest emphasis (#141412 dark elevated surface)
 * 2. Add Clothing: Raised Neumorphic control molded out of #F7F5F0 base material.
 */

import { useRef } from "react";
import { Animated, StyleSheet, View, TouchableOpacity, Text, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing } from "@/theme";
import { homeTokens, neumorphicStyles } from "../theme/homeTokens";
import type { HomeQuickActionsProps } from "../types";

export function HomeQuickActions({
  onAddClothing,
  onGenerateOutfit,
  hasOutfitForSelectedDate = false,
}: HomeQuickActionsProps) {
  const genScale = useRef(new Animated.Value(1)).current;
  const addScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Primary: Generate Outfit (Strongest Visual Emphasis) */}
      <Animated.View style={[{ flex: 1, transform: [{ scale: genScale }] }]}>
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={hasOutfitForSelectedDate ? undefined : onGenerateOutfit}
          onPressIn={() => handlePressIn(genScale)}
          onPressOut={() => handlePressOut(genScale)}
          disabled={hasOutfitForSelectedDate}
          activeOpacity={hasOutfitForSelectedDate ? 1 : 0.9}
          testID="home-generate-outfit"
        >
          <Ionicons
            name={hasOutfitForSelectedDate ? "checkmark-circle" : "sparkles"}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.generateText}>
            {hasOutfitForSelectedDate ? "Outfit Generated" : "Generate Outfit"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Secondary: Add Clothing (Raised Neumorphic Ivory Control) */}
      <Animated.View style={[{ transform: [{ scale: addScale }] }]}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAddClothing}
          onPressIn={() => handlePressIn(addScale)}
          onPressOut={() => handlePressOut(addScale)}
          activeOpacity={0.88}
          testID="home-quick-add"
        >
          <Ionicons name="add" size={17} color={homeTokens.textPrimary} />
          <Text style={styles.addText}>Add Clothing</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 6,
    marginBottom: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    overflow: "visible",
  },
  generateBtn: {
    backgroundColor: "#141412",
    borderRadius: radius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderWidth: 0,
    boxShadow: "0px 6px 16px rgba(20, 20, 18, 0.3)",
    shadowColor: "#141412",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  } as ViewStyle & { boxShadow?: string },
  generateText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  addBtn: {
    backgroundColor: "#F7F5F0",
    borderRadius: radius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    borderWidth: 0,
    boxShadow: "-6px -6px 14px #FFFFFF, 6px 6px 14px rgba(185, 175, 158, 0.6)",
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  } as ViewStyle & { boxShadow?: string },
  addText: {
    fontSize: 13,
    fontWeight: "600",
    color: homeTokens.textPrimary,
    letterSpacing: 0.1,
  },
});
