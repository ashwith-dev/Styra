import {
  Alert,
  Clipboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { colors, radius, spacing, typography } from "@/theme";

interface ContactSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ContactSupportModal({ visible, onClose }: ContactSupportModalProps) {
  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert("Copied", `${label} copied to clipboard.`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close contact support"
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Contact Support
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Subtitle Card */}
          <View style={styles.heroCard}>
            <Ionicons name="headset-outline" size={28} color="#1A1A1A" />
            <View style={styles.heroTextWrapper}>
              <Text style={styles.heroTitle}>We're Here to Help</Text>
              <Text style={styles.heroSubtitle}>
                Our specialized support team is available 24/7 to assist with wardrobe setup, AI styling, and technical questions.
              </Text>
            </View>
          </View>

          {/* Contact Details List */}
          <TouchableOpacity
            onPress={() => handleCopy("support@styra.ai", "Email")}
            activeOpacity={0.8}
            style={styles.infoCard}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="mail" size={20} color="#1A1A1A" />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Support Email</Text>
              <Text style={styles.infoValue}>support@styra.ai</Text>
            </View>
            <Ionicons name="copy-outline" size={18} color="#7F7C76" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCopy("+1 (800) 555-STYRA", "Phone number")}
            activeOpacity={0.8}
            style={styles.infoCard}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={20} color="#1A1A1A" />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Toll-Free Helpline</Text>
              <Text style={styles.infoValue}>+1 (800) 555-STYRA</Text>
            </View>
            <Ionicons name="copy-outline" size={18} color="#7F7C76" />
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="time" size={20} color="#1A1A1A" />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Operating Hours</Text>
              <Text style={styles.infoValue}>Mon – Fri, 9:00 AM – 6:00 PM EST</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="flash" size={20} color="#1A1A1A" />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Expected Response Time</Text>
              <Text style={styles.infoValue}>Under 2 hours for standard tickets</Text>
            </View>
          </View>

          <Button
            label="Close"
            onPress={onClose}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.closeBtn}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EFECE6",
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "#F5F3ED",
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#E5E2D9",
  },
  heroTextWrapper: {
    flex: 1,
  },
  heroTitle: {
    ...typography.caption,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  heroSubtitle: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
    color: "#7F7C76",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#EFECE6",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F4F1EA",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#7F7C76",
    textTransform: "uppercase",
  },
  infoValue: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    marginTop: spacing.lg,
  },
});
