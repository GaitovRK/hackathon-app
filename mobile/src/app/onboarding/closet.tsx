import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { IconButton } from "@/components/Buttons/IconButton";
import { ChipRow } from "@/components/Chips/ChipRow";
import { Icon } from "@/components/Icons/Icon";
import { ItemTile } from "@/components/Items/ItemTile";
import { Screen } from "@/components/Layout/Screen";
import { ProgressBar } from "@/components/Status/SegmentedProgress";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { useFinishOnboarding } from "@/hooks/onboarding/useFinishOnboarding";
import { useStarterPicker } from "@/hooks/onboarding/useStarterPicker";
import { t, type MessageKey } from "@/i18n/t";
import type { ItemCategory } from "@/services/api/types";
import { displayStyle, useTheme } from "@/theme/useTheme";

const COLUMNS = 3;
type Filter = "all" | ItemCategory;

/**
 * "What's already in your closet?" (board screen 02): 3-column mist tiles with a check ring, category filter
 * chips, a sticky "Build my outfits · N" pill. Liked looks are pre-selected. With `?mode=add` (the tab bar +)
 * it only adds items and returns.
 */
export default function StarterClosetScreen() {
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { width } = useWindowDimensions();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const adding = mode === "add";
  const picker = useStarterPicker({ preselect: !adding });
  const finish = useFinishOnboarding(adding ? "add" : "onboard");
  const [filter, setFilter] = useState<Filter>("all");
  const gap = spacing.sm + 2;
  const tileSize = Math.floor((width - spacing.gutter * 2 - gap * (COLUMNS - 1)) / COLUMNS);
  const filterOptions = [{ value: "all" as Filter, label: t("onboarding.filterAll") }, ...picker.groups.map((g) => ({ value: g.category as Filter, label: t(`category.${g.category}` as MessageKey) }))];
  const items = picker.groups.filter((g) => filter === "all" || g.category === filter).flatMap((g) => g.items);
  const count = picker.selected.length;

  return (
    <Screen
      footer={
        <>
          {!adding && !picker.canBuild && count > 0 ? <StatusMessage kind="info" message={t("onboarding.minItems")} /> : null}
          {finish.failed ? <StatusMessage kind="error" message={t("onboarding.failed")} /> : null}
          <ButtonPrimary
            testID="build-outfits"
            label={adding ? t("closet.addStarter") : t("onboarding.buildCount", { count })}
            onPress={() => void finish.finish()}
            loading={finish.busy}
            disabled={adding ? count === 0 : !picker.canBuild}
          />
          <Text testID="selected-count" style={{ color: colors.ink2, fontSize: fontSize.xs, fontFamily: fontFamily.body, textAlign: "center" }}>
            {t("onboarding.selected", { count })}
          </Text>
        </>
      }
    >
      <View style={[styles.row, { gap: spacing.md + 2 }]}>
        <IconButton accessibilityLabel={t("onboarding.back")} onPress={() => router.back()} icon={<Icon name="back" />} />
        {adding ? <View style={styles.flex} /> : <ProgressBar value={0.66} />}
        {adding ? null : <Text style={{ color: colors.ink2, fontSize: fontSize.sm, fontFamily: fontFamily.bodySemibold }}>{t("onboarding.basicsStep", { index: 2, total: 3 })}</Text>}
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text style={displayStyle(38, colors.ink)}>{t("onboarding.basicsTitle")}</Text>
        <Text style={{ color: colors.ink2, fontSize: fontSize.md, fontFamily: fontFamily.body }}>{t("onboarding.basicsSub")}</Text>
      </View>
      <ChipRow testID="basics-filter" options={filterOptions} value={filter} onChange={setFilter} scroll />
      {picker.loading ? <StatusMessage kind="loading" message={t("status.loading")} /> : null}
      {picker.error ? <StatusMessage kind="error" message={t("status.error")} /> : null}
      <View testID="basics-grid" style={[styles.grid, { gap }]}>
        {items.map((s) => (
          <ItemTile key={s.starterKey} testID={`starter-${s.starterKey}`} garment={s} size={tileSize} label selected={picker.selected.includes(s.starterKey)} onPress={() => picker.toggle(s.starterKey)} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ grid: { flexDirection: "row", flexWrap: "wrap" }, row: { flexDirection: "row", alignItems: "center" }, flex: { flex: 1 } });
