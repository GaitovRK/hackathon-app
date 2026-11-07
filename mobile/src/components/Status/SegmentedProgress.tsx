import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/useTheme";

type Props = { index: number; total: number; label?: string; testID?: string };

/** Segmented "7 / 20" progress (board `.seg`): done segments ink, the current one lilac, the rest chip grey. */
export function SegmentedProgress({ index, total, label, testID }: Props) {
  const { colors, spacing, fontSize, fontFamily, block } = useTheme();
  return (
    <View testID={testID} style={{ gap: spacing.sm }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: index }}>
      {label ? <Text style={{ color: colors.ink2, fontSize: fontSize.sm, fontFamily: fontFamily.bodySemibold }}>{label}</Text> : null}
      <View style={[styles.bar, { gap: 3 }]}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.seg, { height: block.barHeight, borderRadius: 3, backgroundColor: i < index ? colors.ink : i === index ? colors.lilac : colors.chip }]} />
        ))}
      </View>
    </View>
  );
}

/** Thin progress bar (board `.bar`): chip track, ink fill. `value` in 0..1. */
export function ProgressBar({ value, testID }: { value: number; testID?: string }) {
  const { colors, block } = useTheme();
  return (
    <View testID={testID} style={[styles.track, { height: block.barHeight, backgroundColor: colors.chip }]}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: "100%", borderRadius: 3, backgroundColor: colors.ink }} />
    </View>
  );
}

const styles = StyleSheet.create({ bar: { flexDirection: "row" }, seg: { flex: 1 }, track: { borderRadius: 3, overflow: "hidden", flex: 1 } });
