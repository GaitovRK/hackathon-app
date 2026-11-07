import { StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/Icons/Icon";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";

/** Mini volt "PRO" pill with a lock (board `.pro`): marks weather, score and locked ideas. */
export function ProBadge({ testID }: { testID?: string }) {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  return (
    <View testID={testID} style={[styles.row, { gap: spacing.xs, backgroundColor: colors.volt, borderRadius: radius.full, paddingHorizontal: spacing.sm, height: 22 }]}>
      <Icon name="lock" size={11} strokeWidth={2.6} />
      <Text style={{ color: colors.ink, fontSize: fontSize.xs - 1.5, fontFamily: fontFamily.bodyBold, letterSpacing: 0.5 }}>{t("ideas.pro")}</Text>
    </View>
  );
}

/** The ink lock circle over a locked idea (board `.lockc`). */
export function LockBadge({ size = 44 }: { size?: number }) {
  const { colors, radius } = useTheme();
  return (
    <View style={[styles.center, { width: size, height: size, borderRadius: radius.full, backgroundColor: colors.ink }]}>
      <Icon name="lock" size={Math.round(size * 0.42)} color={colors.paper} />
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center" }, center: { alignItems: "center", justifyContent: "center" } });
