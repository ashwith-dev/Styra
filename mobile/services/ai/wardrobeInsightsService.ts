import type { ClothingItemBrief } from "@/lib/types";
import type { AIWardrobeInsightV1 } from "@/features/recommendations/types/ai";

export function generateWardrobeInsights(
  items: ClothingItemBrief[],
): AIWardrobeInsightV1 {
  const dist: Record<string, number> = {};
  for (const item of items) {
    const cat = (item.attributes as Record<string, unknown>)?.category;
    const val =
      typeof cat === "object" && cat !== null && "value" in cat
        ? String((cat as { value: unknown }).value)
        : typeof cat === "string"
        ? cat
        : "other";
    dist[val] = (dist[val] || 0) + 1;
  }

  const sortedCats = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  const topStyle = sortedCats.length > 0 ? sortedCats[0][0] : "Casual";

  const suggestions: string[] = [];
  if (!dist.outerwear) suggestions.push("Add a neutral jacket or blazer");
  if (!dist.footwear) suggestions.push("Add versatile sneakers or loafers");
  if (!dist.accessory) suggestions.push("Add accessories to complete looks");

  return {
    totalItems: items.length,
    categoryDistribution: dist,
    topStyle: topStyle.toUpperCase(),
    suggestedAdditions:
      suggestions.length > 0
        ? suggestions
        : ["Your wardrobe has great balance across categories!"],
    generatedAt: new Date().toISOString(),
  };
}
