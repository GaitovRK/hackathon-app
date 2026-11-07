import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/useTheme";

type Props = { title?: string; children: ReactNode; scroll?: boolean };

/** Themed safe-area page with an optional large title. */
export function Screen({ title, children, scroll = true }: Props) {
  const { colors, spacing, fontSize } = useTheme();
  const content = (
    <View style={{ padding: spacing.lg, gap: spacing.lg }}>
      {title ? <Text style={[styles.title, { color: colors.foreground, fontSize: fontSize.xxl }]}>{title}</Text> : null}
      {children}
    </View>
  );
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.flex, { backgroundColor: colors.background }]}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 }, title: { fontWeight: "700" } });
