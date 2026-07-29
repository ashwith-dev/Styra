import { Platform, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

interface WardrobeInsightsSectionProps {
  insights: {
    mostWorn: string;
    favColour: string;
    mostOwned: string;
    newestItem: string;
  };
  totalItems: number;
  savedLooksCount: number;
}

export function WardrobeInsightsSection({
  insights,
  totalItems,
  savedLooksCount,
}: WardrobeInsightsSectionProps) {
  const insightCards = [
    { label: "MOST WORN", value: insights.mostWorn },
    { label: "FAV COLOUR", value: insights.favColour },
    { label: "MOST OWNED", value: insights.mostOwned },
    { label: "NEWEST", value: insights.newestItem },
    { label: "TOTAL ITEMS", value: String(totalItems) },
    { label: "SAVED LOOKS", value: String(savedLooksCount) },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeaderLabel}>WARDROBE INSIGHTS</Text>

      <View style={styles.grid}>
        {insightCards.map((card, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.cardTitle}>{card.label}</Text>
            <Text style={styles.valueText}>{card.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  sectionHeaderLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  card: {
    width: "47.5%",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#EFECE6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#7F7C76",
    textTransform: "uppercase",
    marginBottom: 6,
    textAlign: "center",
  },
  valueText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
});
