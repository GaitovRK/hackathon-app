import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { displayStyle, useTheme } from "@/theme/useTheme";

type Props = { title?: string; children: ReactNode; scroll?: boolean; background?: string; footer?: ReactNode };

/** Safe-area page (20 gutter) with an optional serif title (Instrument Serif 36); `footer` sticks to the bottom above a hairline. */
export function Screen({ title, children, scroll = true, background, footer }: Props) {
  const { colors, spacing, fontSize } = useTheme();
  const content = (
    <View style={{ paddingHorizontal: spacing.gutter, paddingVertical: spacing.lg, gap: spacing.lg }}>
      {title ? <Text style={displayStyle(fontSize.xxl, colors.ink)}>{title}</Text> : null}
      {children}
    </View>
  );
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.flex, { backgroundColor: background ?? colors.background }]}>
      {scroll ? <ScrollView style={styles.flex} keyboardShouldPersistTaps="handled">{content}</ScrollView> : <View style={styles.flex}>{content}</View>}
      {footer ? (
        <View style={{ paddingHorizontal: spacing.gutter, paddingTop: spacing.md + 2, paddingBottom: spacing.xl, gap: spacing.sm + 1, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.paper }}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
