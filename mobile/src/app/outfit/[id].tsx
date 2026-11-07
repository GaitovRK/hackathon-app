import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { GarmentSticker } from "@/components/Items/ItemTile";
import { Screen } from "@/components/Layout/Screen";
import { FlowHeader } from "@/components/Outfit/FlowHeader";
import { OutfitFlatLay } from "@/components/Outfit/OutfitFlatLay";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { t } from "@/i18n/t";
import { localDate, type OutfitItem, type OutfitTemplate } from "@/services/api/types";
import { useAppDispatch, useAppSelector } from "@/store";
import { useOutfitQuery, useSaveIdeasMutation, useSaveOutfitMutation, useWearOutfitMutation } from "@/store/api";
import { ideasSaved } from "@/store/ideasSlice";
import { reasonStyle, useTheme } from "@/theme/useTheme";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Shown = { reason: string; template: OutfitTemplate; items: OutfitItem[] };

/**
 * Outfit detail (board 07): the big half-and-half flat-lay, the reason line, the items, Worn / Save.
 * `id` is either an idea key from the current ideas session (saved on first Save / Worn) or a persisted outfit id.
 */
export default function OutfitDetailScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const ideas = useAppSelector((s) => s.ideas);
  const ideaIndex = ideas.result?.ideas.findIndex((i) => i.key === id) ?? -1;
  const idea = ideaIndex >= 0 ? ideas.result!.ideas[ideaIndex] : null;
  const savedIdeaId = idea ? ideas.savedIds[idea.key] : undefined;
  const outfitId = idea ? savedIdeaId : UUID.test(id) ? id : undefined;

  const query = useOutfitQuery(outfitId ?? "", { skip: !outfitId });
  const [saveIdeas, saveIdeasState] = useSaveIdeasMutation();
  const [saveOutfit, saveOutfitState] = useSaveOutfitMutation();
  const [wear, wearState] = useWearOutfitMutation();
  const [error, setError] = useState(false);

  const shown: Shown | null = idea ?? query.data ?? null;
  const status = query.data?.status ?? (savedIdeaId ? "saved" : "suggested");
  const busy = saveIdeasState.isLoading || saveOutfitState.isLoading || wearState.isLoading;

  /** Persists an idea the first time it is saved or worn; resolves the outfit id. */
  const ensureSaved = async (): Promise<string> => {
    if (outfitId) return outfitId;
    const outfits = await saveIdeas({ occasion: ideas.brief?.occasion, date: ideas.brief?.date, ideas: [{ template: idea!.template, itemIds: idea!.items.map((x) => x.item.id) }] }).unwrap();
    dispatch(ideasSaved({ keys: [idea!.key], outfits }));
    return outfits[0].id;
  };
  const run = async (action: () => Promise<unknown>) => {
    setError(false);
    try {
      await action();
    } catch {
      setError(true);
    }
  };
  const onSave = () => run(async () => (idea ? ensureSaved() : saveOutfit(id).unwrap()));
  const onWear = () => run(async () => wear({ id: await ensureSaved(), date: localDate() }).unwrap());

  const title = idea && ideas.result ? t("ideas.lookOf", { index: ideaIndex + 1, total: ideas.result.ideas.length }) : t("ideas.detailTitle");
  const flatLayWidth = Math.min(300, Math.round((width - spacing.lg * 4) * 0.8));

  return (
    <Screen background={colors.surfaceAlt}>
      <FlowHeader title={title} />
      {!shown && query.isError ? <StatusMessage kind="error" message={t("ideas.notFound")} /> : null}
      {!shown && !query.isError ? <StatusMessage kind="loading" message={t("status.loading")} /> : null}
      {shown ? (
        <>
          <View style={[styles.center, { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg }]}>
            <OutfitFlatLay testID="outfit-flatlay" garments={shown.items.map((i) => i.item)} width={flatLayWidth} />
            <View style={[styles.pill, { left: spacing.md, bottom: spacing.md, backgroundColor: colors.surfaceAlt, borderRadius: radius.full, paddingHorizontal: spacing.md }]}>
              <Text style={{ color: colors.muted, fontSize: fontSize.xs, fontFamily: fontFamily.bodySemibold }}>{t("ideas.laidOut")}</Text>
            </View>
          </View>
          <Text testID="outfit-reason" style={reasonStyle(fontSize.reason, colors.ink)}>
            {shown.reason}
          </Text>
          <Text style={{ color: colors.foreground, fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold }}>{t("ideas.itemsCount", { count: shown.items.length })}</Text>
          <View style={[styles.row, { gap: spacing.sm }]}>
            {shown.items.map((i) => (
              <View key={i.slot} style={[styles.center, styles.flex, { gap: spacing.xs }]}>
                <View style={[styles.center, { width: 58, height: 58, borderRadius: radius.md, backgroundColor: colors.surface }]}>
                  <GarmentSticker garment={i.item} size={44} />
                </View>
                <Text numberOfLines={1} style={{ color: colors.muted, fontSize: fontSize.xs, fontFamily: fontFamily.bodySemibold }}>
                  {i.item.name}
                </Text>
              </View>
            ))}
          </View>
          {error ? <StatusMessage kind="error" message={t("status.error")} /> : null}
          <ButtonPrimary testID="outfit-wear" label={status === "worn" ? t("ideas.worn") : t("ideas.wearToday")} onPress={() => void onWear()} disabled={status === "worn"} loading={busy} />
          <ButtonSecondary testID="outfit-save" label={status === "suggested" ? t("ideas.saveOne") : t("ideas.savedOne")} onPress={() => void onSave()} disabled={status !== "suggested"} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row" },
  flex: { flex: 1 },
  pill: { position: "absolute", height: 26, justifyContent: "center" },
});
