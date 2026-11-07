import { router } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { IconButton } from "@/components/Buttons/IconButton";
import { Icon } from "@/components/Icons/Icon";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";

type Props = { title: string; subtitle?: string; right?: ReactNode; testID?: string };

/** Back circle + centered title / subtitle (board 05–07 headers). `right` keeps the title centered (a 44pt spacer otherwise). */
export function FlowHeader({ title, subtitle, right, testID }: Props) {
  const { colors, spacing, fontSize, fontFamily, block } = useTheme();
  return (
    <View testID={testID} style={[styles.row, { gap: spacing.sm }]}>
      <IconButton testID="flow-back" tone="line" accessibilityLabel={t("ideas.back")} onPress={() => router.back()} icon={<Icon name="back" />} />
      <View style={styles.center}>
        <Text style={{ color: colors.ink, fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.ink2, fontSize: fontSize.xs, fontFamily: fontFamily.bodySemibold }}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.spacer, { width: block.iconButton, minHeight: block.iconButton }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  spacer: { alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", gap: 2 },
});
