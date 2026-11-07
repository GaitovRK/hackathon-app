import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";

/** Thin outline lock (board `#i-lock`, 24 grid). */
export function LockIcon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 11V8a5 5 0 0 1 10 0v3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 11h14v10H5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

/** Mini "PRO" pill with a lock (board `.pro`): marks weather, score and locked ideas. Pro = the volt accent. */
export function ProBadge({ testID }: { testID?: string }) {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  return (
    <View testID={testID} style={[styles.row, { gap: spacing.xs, backgroundColor: colors.warning, borderRadius: radius.full, paddingHorizontal: spacing.sm, height: 22 }]}>
      <LockIcon size={12} color={colors.foreground} />
      <Text style={{ color: colors.foreground, fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold }}>{t("ideas.pro")}</Text>
    </View>
  );
}

/** The ink lock circle over a locked idea (board `.lockc`). */
export function LockBadge({ size = 44 }: { size?: number }) {
  const { colors, radius } = useTheme();
  return (
    <View style={[styles.center, { width: size, height: size, borderRadius: radius.full, backgroundColor: colors.foreground }]}>
      <LockIcon size={size * 0.45} color={colors.background} />
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center" }, center: { alignItems: "center", justifyContent: "center" } });
