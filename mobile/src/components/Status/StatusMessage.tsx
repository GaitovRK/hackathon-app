import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/useTheme";

type Props = { kind: "loading" | "error" | "info"; message: string };

/** Inline loading / error / info line. */
export function StatusMessage({ kind, message }: Props) {
  const { colors, spacing, fontSize } = useTheme();
  const color = kind === "error" ? colors.danger : colors.muted;
  return (
    <View style={[styles.row, { gap: spacing.sm }]} accessibilityLiveRegion="polite">
      {kind === "loading" ? <ActivityIndicator color={colors.muted} /> : null}
      <Text style={{ color, fontSize: fontSize.md }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center" } });
