import { StyleSheet, Text, View } from "react-native";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";

type Props = { count: number; limit: number | null };

/** "23 / 50" closet meter: a chunky bar for free users, "23 items" for Pro (no limit). */
export function ItemMeter({ count, limit }: Props) {
  const { colors, radius, spacing, fontSize, fontFamily, block } = useTheme();
  const ratio = limit ? Math.min(1, count / limit) : 0;
  return (
    <View testID="item-meter" style={{ gap: spacing.xs }}>
      <Text style={{ color: colors.foreground, fontSize: fontSize.xl, fontFamily: fontFamily.display }}>
        {limit === null ? t("closet.count", { count }) : `${count} / ${limit}`}
      </Text>
      {limit !== null ? (
        <View style={[styles.bar, { borderColor: colors.border, borderWidth: block.buttonBorder, borderRadius: radius.full, backgroundColor: colors.surface }]}>
          <View style={{ width: `${ratio * 100}%`, height: "100%", backgroundColor: ratio >= 1 ? colors.warning : colors.accentSoft }} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ bar: { height: 14, overflow: "hidden" } });
