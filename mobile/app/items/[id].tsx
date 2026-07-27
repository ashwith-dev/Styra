import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as api from "../../lib/api";
import type { ClothingItemDetail } from "../../lib/types";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<ClothingItemDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getClothingItem(id);
        setItem(data);
      } catch {
        Alert.alert("Error", "Could not load item");
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!item) return null;

  const attrs = item.attributes || {};

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: item.segmented_image_url }}
        style={styles.image}
      />

      <View style={styles.section}>
        <Text style={styles.title}>Details</Text>
        {renderAttr("Category", attrs["category"])}
        {renderAttr("Type", attrs["type"])}
        {renderAttr("Color", attrs["color"])}
        {renderAttr("Pattern", attrs["pattern"])}
        {renderAttr("Material", attrs["material"])}
        {renderAttr("Style", attrs["style"])}
        {renderAttr("Neckline", attrs["neckline"])}
        {renderAttr("Sleeve Length", attrs["sleeve_length"])}
        {renderAttr("Fit", attrs["fit"])}
        {renderAttr("Length", attrs["length"])}
        {renderAttr("Closure", attrs["closure"])}
      </View>

      {item.raw_pipeline_result && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.push("/upload/capture")}
        >
          <Text style={styles.retryButtonText}>Add Another Item</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function renderAttr(label: string, attr: unknown) {
  if (!attr) return null;
  const value = typeof attr === "object" && attr !== null && "value" in attr
    ? (attr as any).value
    : attr;
  const confidence = typeof attr === "object" && attr !== null && "confidence" in attr
    ? (attr as any).confidence
    : null;

  return (
    <View style={styles.attrRow}>
      <Text style={styles.attrLabel}>{label}</Text>
      <Text style={styles.attrValue}>
        {String(value)}
        {confidence != null && (
          <Text style={styles.confidence}>
            {"  "}({Math.round(confidence * 100)}%)
          </Text>
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", aspectRatio: 1 },
  section: { padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  attrRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  attrLabel: { fontSize: 14, color: "#666", flex: 1 },
  attrValue: { fontSize: 14, fontWeight: "500", flex: 2, textAlign: "right" },
  confidence: { fontSize: 12, color: "#999" },
  retryButton: {
    marginHorizontal: 16, marginTop: 24,
    backgroundColor: "#000", borderRadius: 8, padding: 16, alignItems: "center",
  },
  retryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
