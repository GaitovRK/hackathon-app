import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Icon } from "@/components/Icons/Icon";
import { useTheme } from "@/theme/useTheme";

type Props = { done: number; total: number; title: string; subtitle?: string; progressLabel: string; onPress?: () => void; testID?: string };

const R = 18;
const C = 2 * Math.PI * R;

/** Board ProgressRing + the next checklist step on a mist card ("2/4 · Add 3 photos of your own"). */
export function SetupChecklist({ done, total, title, subtitle, progressLabel, onPress, testID }: Props) {
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const ratio = total ? Math.min(1, done / total) : 0;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.mist, borderRadius: 18, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, gap: spacing.md }]}
    >
      <View style={styles.ring}>
        <Svg width={44} height={44} viewBox="0 0 44 44" style={StyleSheet.absoluteFill}>
          <Circle cx={22} cy={22} r={R} fill="none" stroke="#E0E0E0" strokeWidth={4} />
          <Circle cx={22} cy={22} r={R} fill="none" stroke={colors.ink} strokeWidth={4} strokeLinecap="round" strokeDasharray={`${C * ratio} ${C}`} rotation={-90} origin="22, 22" />
        </Svg>
        <Text style={{ color: colors.ink, fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold }}>{progressLabel}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={{ color: colors.ink, fontSize: fontSize.sm + 1, fontFamily: fontFamily.bodyBold }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.ink2, fontSize: fontSize.xs, fontFamily: fontFamily.body }}>{subtitle}</Text> : null}
      </View>
      {onPress ? <Icon name="chev" color={colors.ink3} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center" },
  ring: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, minWidth: 0 },
});
