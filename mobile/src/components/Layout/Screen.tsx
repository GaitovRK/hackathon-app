import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { displayStyle, useTheme } from "@/theme/useTheme";

type Props = { title?: string; children: ReactNode; scroll?: boolean; background?: string };

/** Safe-area page with an optional display title (Bricolage 800); `background` lets a screen color-block itself. */
export function Screen({ title, children, scroll = true, background }: Props) {
  const { colors, spacing, fontSize } = useTheme();
  const content = (
    <View style={{ padding: spacing.lg, gap: spacing.lg }}>
      {title ? <Text style={displayStyle(fontSize.xxl, colors.foreground)}>{title}</Text> : null}
      {children}
    </View>
  );
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.flex, { backgroundColor: background ?? colors.background }]}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
