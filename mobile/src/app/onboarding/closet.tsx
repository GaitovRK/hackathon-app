import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ItemTile } from "@/components/Items/ItemTile";
import { Screen } from "@/components/Layout/Screen";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { useFinishOnboarding } from "@/hooks/onboarding/useFinishOnboarding";
import { useStarterPicker } from "@/hooks/onboarding/useStarterPicker";
import { t, type MessageKey } from "@/i18n/t";
import { displayStyle, useTheme } from "@/theme/useTheme";

/**
 * Starter closet picker: "What's already in your closet?" as a grid by category, tap to select (liked looks
 * pre-selected), then "Build my outfits". With `?mode=add` (Closet tab) it only adds items and returns.
 */
export default function StarterClosetScreen() {
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const adding = mode === "add";
  const picker = useStarterPicker({ preselect: !adding });
  const finish = useFinishOnboarding(adding ? "add" : "onboard");

  return (
    <Screen title={t("onboarding.closetTitle")}>
      <Text style={{ color: colors.muted, fontSize: fontSize.md, fontFamily: fontFamily.body }}>{t("onboarding.closetHint")}</Text>
      {picker.loading ? <StatusMessage kind="loading" message={t("status.loading")} /> : null}
      {picker.error ? <StatusMessage kind="error" message={t("status.error")} /> : null}
      {picker.groups.map((g) => (
        <View key={g.category} style={{ gap: spacing.sm }}>
          <Text style={displayStyle(fontSize.lg, colors.foreground)}>{t(`category.${g.category}` as MessageKey)}</Text>
          <View style={[styles.grid, { gap: spacing.sm }]}>
            {g.items.map((s) => (
              <ItemTile key={s.starterKey} testID={`starter-${s.starterKey}`} garment={s} size={96} label thickCut selected={picker.selected.includes(s.starterKey)} onPress={() => picker.toggle(s.starterKey)} />
            ))}
          </View>
        </View>
      ))}
      <Text style={{ color: colors.muted, fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold }}>{t("onboarding.selected", { count: picker.selected.length })}</Text>
      {!adding && !picker.canBuild && picker.selected.length > 0 ? <StatusMessage kind="info" message={t("onboarding.minItems")} /> : null}
      {finish.failed ? <StatusMessage kind="error" message={t("onboarding.failed")} /> : null}
      <ButtonPrimary
        testID="build-outfits"
        label={adding ? t("closet.addStarter") : t("onboarding.build")}
        onPress={() => void finish.finish()}
        loading={finish.busy}
        disabled={adding ? picker.selected.length === 0 : !picker.canBuild}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ grid: { flexDirection: "row", flexWrap: "wrap" } });
