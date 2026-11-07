import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonVolt } from "@/components/Buttons/ButtonSecondary";
import { Icon } from "@/components/Icons/Icon";
import { IdeasGrid } from "@/components/Ideas/IdeasGrid";
import { Screen } from "@/components/Layout/Screen";
import { FlowHeader } from "@/components/Outfit/FlowHeader";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { useProPaywall } from "@/hooks/purchases/useProPaywall";
import { t, type MessageKey } from "@/i18n/t";
import { useAppDispatch, useAppSelector } from "@/store";
import { useGenerateIdeasMutation, useSaveIdeasMutation } from "@/store/api";
import { ideasReceived, ideasSaved, ideaToggled } from "@/store/ideasSlice";
import { useTheme } from "@/theme/useTheme";

/** Ideas grid (board 06): like several, "Save N liked"; locked grey cards + "Unlock N more" open the RevenueCat paywall. */
export default function IdeasScreen() {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { brief, result, selected, savedIds } = useAppSelector((s) => s.ideas);
  const [save, saveState] = useSaveIdeasMutation();
  const [regenerate, regenerateState] = useGenerateIdeasMutation();
  const pro = useProPaywall();
  const [error, setError] = useState(false);

  if (!brief || !result) {
    return (
      <Screen>
        <FlowHeader title={t("ideas.title")} />
        <StatusMessage kind="info" message={t("ideas.empty")} />
        <ButtonPrimary testID="ideas-start" label={t("ideas.start")} onPress={() => router.replace("/generate")} />
      </Screen>
    );
  }

  const savedCount = Object.keys(savedIds).length;
  const picked = result.ideas.filter((i) => selected.includes(i.key));

  const saveLiked = async () => {
    setError(false);
    try {
      const outfits = await save({ occasion: brief.occasion, date: brief.date, ideas: picked.map((i) => ({ template: i.template, itemIds: i.items.map((x) => x.item.id) })) }).unwrap();
      dispatch(ideasSaved({ keys: picked.map((i) => i.key), outfits }));
    } catch {
      setError(true);
    }
  };

  const unlock = async () => {
    if (!(await pro.open())) return;
    try {
      dispatch(ideasReceived({ brief, result: await regenerate(brief).unwrap() }));
    } catch {
      setError(true);
    }
  };

  return (
    <Screen>
      <FlowHeader title={t("ideas.title")} />
      <Pressable
        testID="ideas-brief"
        accessibilityRole="button"
        onPress={() => router.back()}
        style={[styles.row, { gap: spacing.md, height: 58, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderSoft, paddingHorizontal: spacing.lg }]}
      >
        <View style={styles.flex}>
          <Text style={{ color: colors.foreground, fontSize: fontSize.md, fontFamily: fontFamily.bodyBold }}>{t(`occasion.${brief.occasion}` as MessageKey)}</Text>
          <Text style={{ color: colors.muted, fontSize: fontSize.xs, fontFamily: fontFamily.bodySemibold }}>
            {t("ideas.summary", { vibe: t(`ideas.vibe.${brief.vibe}` as MessageKey), formality: brief.formality })}
          </Text>
        </View>
        <Text style={{ color: colors.muted, fontSize: fontSize.sm, fontFamily: fontFamily.bodySemibold }}>{t("ideas.edit")}</Text>
      </Pressable>

      <View style={[styles.row, styles.between]}>
        <Text style={[styles.flex, { color: colors.muted, fontSize: fontSize.sm, fontFamily: fontFamily.body }]}>{t("ideas.hint")}</Text>
        <View style={{ backgroundColor: colors.lilac, borderRadius: radius.full, paddingHorizontal: spacing.md, height: 28, justifyContent: "center" }}>
          <Text testID="ideas-liked-count" style={{ color: colors.foreground, fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold }}>
            {t("ideas.liked", { count: selected.length })}
          </Text>
        </View>
      </View>

      {result.closetTooSmall ? <StatusMessage kind="info" message={t("ideas.closetTooSmall")} /> : null}
      <IdeasGrid
        testID="ideas-grid"
        ideas={result.ideas}
        locked={result.locked}
        selected={selected}
        width={width - spacing.lg * 2}
        onToggle={(key) => dispatch(ideaToggled(key))}
        onOpen={(key) => router.push(`/outfit/${key}`)}
        onUnlock={() => void unlock()}
      />

      {error ? <StatusMessage kind="error" message={t("ideas.failed")} /> : null}
      {savedCount > 0 ? <StatusMessage kind="info" message={t("ideas.savedCount", { count: savedCount })} /> : null}
      <ButtonPrimary
        testID="ideas-save"
        label={picked.length ? t("ideas.save", { count: picked.length }) : t("ideas.saveNone")}
        onPress={() => void saveLiked()}
        disabled={picked.length === 0}
        loading={saveState.isLoading}
      />
      {result.lockedCount > 0 ? (
        <View style={{ gap: spacing.xs }}>
          <ButtonVolt testID="ideas-unlock" icon={<Icon name="lock" size={16} />} label={t("ideas.unlock", { count: result.lockedCount })} onPress={() => void unlock()} loading={pro.opening || regenerateState.isLoading} />
          <View style={[styles.row, { gap: spacing.xs, justifyContent: "center" }]}>
            <Icon name="lock" size={12} color={colors.ink3} />
            <Text style={{ color: colors.muted, fontSize: fontSize.xs, fontFamily: fontFamily.bodySemibold }}>{t("ideas.plans", { free: result.freeVisible, pro: result.proMax })}</Text>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center" }, between: { justifyContent: "space-between", gap: 8 }, flex: { flex: 1 } });
