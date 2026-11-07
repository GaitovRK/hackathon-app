import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/useTheme";

type Props = { index: number; total: number; label?: string; testID?: string };

/** Segmented "7 / 20" progress (board `.s1 .bar`): done segments ink, the current one accent, the rest line. */
export function SegmentedProgress({ index, total, label, testID }: Props) {
  const { colors, spacing, fontSize, fontFamily, radius } = useTheme();
  return (
    <View testID={testID} style={{ gap: spacing.sm }}>
      {label ? <Text style={{ color: colors.muted, fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold }}>{label}</Text> : null}
      <View style={[styles.bar, { gap: 3 }]}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.seg, { borderRadius: radius.sm / 2, backgroundColor: i < index ? colors.foreground : i === index ? colors.accent : colors.borderSoft }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ bar: { flexDirection: "row" }, seg: { flex: 1, height: 6 } });
