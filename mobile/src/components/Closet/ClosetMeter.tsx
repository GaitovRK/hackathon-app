import { StyleSheet, Text, View } from "react-native";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";

type Props = { count: number; limit: number | null };

/** Compact header meter (board option A): "23 / 50 items" + a thin bar on Free, "23 items · Unlimited" on Pro. */
export function ClosetMeter({ count, limit }: Props) {
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const ratio = limit ? Math.min(1, count / limit) : 0;
  return (
    <View testID="closet-meter" style={[styles.wrap, { gap: spacing.xs + 2 }]}>
      <Text style={{ color: colors.foreground, fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold }}>
        {limit === null ? t("closet.count", { count }) : `${count} `}
        <Text style={{ color: colors.muted }}>{limit === null ? ` ${t("closet.unlimited")}` : t("closet.meterOf", { limit })}</Text>
      </Text>
      {limit !== null ? (
        <View style={[styles.bar, { backgroundColor: colors.surfaceAlt }]}>
          <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: ratio >= 1 ? colors.warning : colors.foreground }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "flex-end" },
  bar: { width: 96, height: 5, borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
});
