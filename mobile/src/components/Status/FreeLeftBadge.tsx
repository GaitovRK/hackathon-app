import { StyleSheet, Text, View } from "react-native";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";

type Props = { freeLeftToday: number; isPro: boolean };

/** "3 free left today" pill (or "Pro: unlimited"). */
export function FreeLeftBadge({ freeLeftToday, isPro }: Props) {
  const { colors, radius, spacing, fontSize } = useTheme();
  return (
    <View
      testID="free-left"
      style={[styles.pill, { borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]}
    >
      <Text style={{ color: freeLeftToday > 0 || isPro ? colors.muted : colors.warning, fontSize: fontSize.sm }}>
        {isPro ? t("home.pro") : t("home.freeLeft", { count: freeLeftToday })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({ pill: { alignSelf: "flex-start", borderWidth: StyleSheet.hairlineWidth } });
