import { StyleSheet, Text, View, type ViewStyle } from "react-native";
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
    backgroundColor: "#F7F5F0",
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 0,
    boxShadow: "-6px -6px 16px #FFFFFF, 6px 6px 16px rgba(185, 175, 158, 0.65)",
    shadowColor: "#000000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle & { boxShadow?: string },
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
