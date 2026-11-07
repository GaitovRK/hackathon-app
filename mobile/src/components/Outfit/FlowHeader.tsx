import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";

type Props = { title: string; subtitle?: string; right?: ReactNode; testID?: string };

/** Back circle + centered title / subtitle (board 05–07 headers). `right` keeps the title centered (a 44pt spacer otherwise). */
export function FlowHeader({ title, subtitle, right, testID }: Props) {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  return (
    <View testID={testID} style={[styles.row, { gap: spacing.sm }]}>
      <Pressable
        testID="flow-back"
        accessibilityRole="button"
        accessibilityLabel={t("ideas.back")}
        onPress={() => router.back()}
        style={[styles.circle, { width: 44, height: 44, borderRadius: radius.full, borderColor: colors.borderSoft, backgroundColor: colors.surface }]}
      >
        <Text style={{ color: colors.foreground, fontSize: fontSize.lg }}>‹</Text>
      </Pressable>
      <View style={styles.center}>
        <Text style={{ color: colors.foreground, fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.muted, fontSize: fontSize.xs, fontFamily: fontFamily.bodySemibold }}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.circle, { width: 44, minHeight: 44 }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  circle: { alignItems: "center", justifyContent: "center", borderWidth: 1 },
  center: { flex: 1, alignItems: "center", gap: 2 },
});
