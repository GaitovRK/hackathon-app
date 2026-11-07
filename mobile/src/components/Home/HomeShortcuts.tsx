import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";

/** Home entry points for the outfit flows (#9): Generate ideas (quick questions) and Dress me (manual rows). One line on the Home screen. */
export function HomeShortcuts() {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  const tile = (title: string, sub: string, onPress: () => void, testID: string, background: string) => (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { backgroundColor: background, borderColor: colors.borderSoft, borderRadius: radius.tile, padding: spacing.lg, gap: spacing.xs }, pressed && styles.dim]}
    >
      <Text style={{ color: colors.foreground, fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold }}>{title}</Text>
      <Text style={{ color: colors.muted, fontSize: fontSize.xs, fontFamily: fontFamily.bodySemibold }}>{sub}</Text>
    </Pressable>
  );
  return (
    <View style={[styles.row, { gap: spacing.md }]}>
      {tile(t("home.generate"), t("home.generateSub"), () => router.push("/generate"), "home-generate", colors.lilac2)}
      {tile(t("home.dressMe"), t("home.dressMeSub"), () => router.push("/dress-me"), "home-dress-me", colors.mist)}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row" }, tile: { flex: 1, borderWidth: 1 }, dim: { opacity: 0.8 } });
