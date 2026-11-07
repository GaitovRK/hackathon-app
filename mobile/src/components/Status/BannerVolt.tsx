import { StyleSheet, Text, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { useTheme } from "@/theme/useTheme";

type Props = { title: string; subtitle?: string; actionLabel?: string; onAction?: () => void; testID?: string };

/** Lime Pro / upsell banner (board `.banner`): volt block, title + sub, a small ink button. */
export function BannerVolt({ title, subtitle, actionLabel, onAction, testID }: Props) {
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  return (
    <View testID={testID} style={[styles.banner, { backgroundColor: colors.volt, borderRadius: 20, padding: spacing.md, paddingLeft: spacing.lg, gap: spacing.sm + 2 }]}>
      <View style={styles.flex}>
        <Text style={{ color: colors.ink, fontSize: fontSize.md, fontFamily: fontFamily.bodyBold }}>{title}</Text>
        {subtitle ? <Text style={{ color: "#2C3300", fontSize: fontSize.xs + 0.5, fontFamily: fontFamily.body }}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? <ButtonPrimary testID={testID ? `${testID}-action` : undefined} small inline label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({ banner: { flexDirection: "row", alignItems: "center" }, flex: { flex: 1, minWidth: 0 } });
