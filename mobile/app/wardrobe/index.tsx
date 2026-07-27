import { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useWardrobe } from "../../hooks/useWardrobe";
import { useAuth } from "../../providers/AuthProvider";

export default function WardrobeScreen() {
  const { items, loading, refresh, removeItem } = useWardrobe();
  const { signOut } = useAuth();

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert("Remove Item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeItem(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Wardrobe</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/upload/capture")}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.signOut}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid */}
      {loading && items.length === 0 ? (
        <ActivityIndicator size="large" style={{ marginTop: 60 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your wardrobe is empty</Text>
          <Text style={styles.emptySubtitle}>
            Take a photo of your first clothing item to get started.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/upload/capture")}
          >
            <Text style={styles.emptyButtonText}>Add First Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(item) => item.id}
          onRefresh={refresh}
          refreshing={loading}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/items/${item.id}`)}
              onLongPress={() => handleDelete(item.id)}
            >
              <Image
                source={{ uri: item.thumbnail_url || item.segmented_image_url }}
                style={styles.thumb}
              />
              <Text style={styles.cardLabel} numberOfLines={1}>
                {getLabel(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function getLabel(item: any): string {
  const attrs = item.attributes || {};
  const color = attrs.color?.value || "";
  const type = attrs.type?.value || "item";
  return [color, type].filter(Boolean).join(" ");
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: "700" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  addButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  signOut: { color: "#007AFF", fontSize: 14 },
  row: { justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 16 },
  card: { width: "48%", borderRadius: 12, overflow: "hidden", backgroundColor: "#f5f5f5" },
  thumb: { width: "100%", aspectRatio: 1 },
  cardLabel: { padding: 8, fontSize: 13, fontWeight: "500" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: "#666", textAlign: "center", marginBottom: 24 },
  emptyButton: { backgroundColor: "#000", borderRadius: 8, paddingHorizontal: 24, paddingVertical: 14 },
  emptyButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
