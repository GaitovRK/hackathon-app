import { Text, View } from "react-native";
import { t } from "@/i18n/t";
import { displayStyle, useTheme } from "@/theme/useTheme";
import { ProgressBar } from "./SegmentedProgress";

type Props = { count: number; limit: number | null };

/** "23 / 50" closet meter: a serif number + a thin ink bar for free users (volt when full), "23 items" for Pro. */
export function ItemMeter({ count, limit }: Props) {
  const { colors, spacing } = useTheme();
  const ratio = limit ? Math.min(1, count / limit) : 0;
  return (
    <View testID="item-meter" style={{ gap: spacing.sm }}>
      <Text style={displayStyle(34, colors.ink)}>{limit === null ? t("closet.count", { count }) : `${count} / ${limit}`}</Text>
      {limit !== null ? (
        <View style={{ flexDirection: "row" }}>
          <ProgressBar value={ratio} />
        </View>
      ) : null}
    </View>
  );
}
