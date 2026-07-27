import { Component, type ErrorInfo, type ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colors, fontSize, fontWeight, spacing } from "../../lib/theme";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  handleGoToWardrobe = () => {
    this.setState({ error: null });
    router.replace("/wardrobe");
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            An unexpected error occurred.
          </Text>
          <View style={styles.actions}>
            <Button label="Try Again" onPress={this.handleRetry} />
            <Button
              label="Go to Wardrobe"
              onPress={this.handleGoToWardrobe}
              variant="outline"
            />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: "center",
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  actions: {
    width: "100%",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
