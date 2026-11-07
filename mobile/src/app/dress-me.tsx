import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { Chip } from "@/components/Chips/Chip";
import { RowSwiper } from "@/components/DressMe/RowSwiper";
import { Screen } from "@/components/Layout/Screen";
import { FlowHeader } from "@/components/Outfit/FlowHeader";
import { ProBadge } from "@/components/Outfit/ProBadge";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { useProPaywall } from "@/hooks/purchases/useProPaywall";
import { t, type MessageKey } from "@/i18n/t";
import { localDate, templateFor, type Item, type ItemCategory } from "@/services/api/types";
import { useAppSelector } from "@/store";
import { useItemsQuery, useSaveIdeasMutation } from "@/store/api";
import { useTheme } from "@/theme/useTheme";

const REQUIRED: ItemCategory[] = ["top", "bottom", "shoes"];
const OPTIONAL: ItemCategory = "outerwear";

/** Picks a new random index for a row (different from the current one when the row has alternatives). */
export function shuffleIndex(current: number, length: number, random: () => number = Math.random): number {
  if (length <= 1) return 0;
  const next = Math.floor(random() * (length - 1));
  return next >= current ? next + 1 : next;
}

/** Dress me (board 04): a swipe row per category, pin a row and Shuffle the rest, then save the look as an outfit. Uses the closet items endpoint. */
export default function DressMeScreen() {
  const { colors, spacing, fontSize, fontFamily, radius } = useTheme();
  const ready = useAppSelector((s) => s.session.status === "ready");
  const items = useItemsQuery(undefined, { skip: !ready });
  const [save, saveState] = useSaveIdeasMutation();
  const pro = useProPaywall();
  const [rows4, setRows4] = useState(false);
  const [index, setIndex] = useState<Partial<Record<ItemCategory, number>>>({});
  const [pinned, setPinned] = useState<ItemCategory[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const byCategory = useMemo(() => {
    const by: Record<ItemCategory, Item[]> = { top: [], bottom: [], dress: [], outerwear: [], shoes: [], accessory: [] };
    for (const i of items.data ?? []) by[i.category].push(i);
    return by;
  }, [items.data]);

  const categories = rows4 && byCategory.outerwear.length ? [OPTIONAL, ...REQUIRED] : REQUIRED;
  const canDress = REQUIRED.every((c) => byCategory[c].length > 0);
  const pickOf = (c: ItemCategory) => byCategory[c][index[c] ?? 0];
  const allStarter = (items.data ?? []).length > 0 && (items.data ?? []).every((i) => i.source === "starter");

  const setPick = (c: ItemCategory, i: number) => {
    setSavedId(null);
    setIndex((prev) => ({ ...prev, [c]: i }));
  };
  const shuffle = () => {
    setSavedId(null);
    setIndex((prev) => {
      const next = { ...prev };
      for (const c of categories) if (!pinned.includes(c)) next[c] = shuffleIndex(prev[c] ?? 0, byCategory[c].length);
      return next;
    });
  };
  const saveLook = async () => {
    setError(false);
    const picks = categories.map(pickOf);
    try {
      const [outfit] = await save({ occasion: "casual", date: localDate(), ideas: [{ template: templateFor(picks), itemIds: picks.map((p) => p.id) }] }).unwrap();
      setSavedId(outfit.id);
    } catch {
      setError(true);
    }
  };

  return (
    <Screen>
      <FlowHeader
        title={t("dressMe.title")}
        right={
          <Pressable testID="dressme-score" accessibilityRole="button" onPress={() => void pro.open()}>
            <ProBadge />
          </Pressable>
        }
      />
      <View style={[styles.row, { gap: spacing.sm }]}>
        <Chip testID="dressme-rows3" label={t("dressMe.rows3")} selected={!rows4} onPress={() => setRows4(false)} />
        <Chip testID="dressme-rows4" label={t("dressMe.rows4")} selected={rows4} onPress={() => setRows4(true)} />
      </View>

      {items.isLoading ? <StatusMessage kind="loading" message={t("status.loading")} /> : null}
      {items.isError ? <StatusMessage kind="error" message={t("dressMe.failed")} /> : null}
      {items.data && !canDress ? (
        <>
          <StatusMessage kind="info" message={t("dressMe.empty")} />
          <ButtonPrimary testID="dressme-add-items" label={t("today.addItems")} onPress={() => router.push({ pathname: "/onboarding/closet", params: { mode: "add" } })} />
        </>
      ) : null}

      {canDress ? (
        <View style={{ marginHorizontal: -spacing.lg, gap: spacing.md }}>
          {categories.map((c) => (
            <RowSwiper
              key={c}
              testID={`dressme-${c}`}
              label={t(`category.${c}` as MessageKey)}
              items={byCategory[c]}
              index={index[c] ?? 0}
              pinned={pinned.includes(c)}
              onIndexChange={(i) => setPick(c, i)}
              onTogglePin={() => setPinned((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}
            />
          ))}
        </View>
      ) : null}

      {allStarter ? (
        <View style={[styles.row, { gap: spacing.md, backgroundColor: colors.warning, borderRadius: radius.tile, padding: spacing.lg }]}>
          <View style={styles.flex}>
            <Text style={{ color: colors.foreground, fontSize: fontSize.md, fontFamily: fontFamily.bodyBold }}>{t("dressMe.bannerTitle")}</Text>
            <Text style={{ color: colors.foreground, fontSize: fontSize.xs, fontFamily: fontFamily.body }}>{t("dressMe.bannerBody")}</Text>
          </View>
          <Pressable testID="dressme-add-photos" accessibilityRole="button" onPress={() => router.push({ pathname: "/onboarding/closet", params: { mode: "add" } })} style={{ backgroundColor: colors.foreground, borderRadius: radius.full, paddingHorizontal: spacing.md, height: 38, justifyContent: "center" }}>
            <Text style={{ color: colors.background, fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold }}>{t("dressMe.addPhotos")}</Text>
          </Pressable>
        </View>
      ) : null}

      {error ? <StatusMessage kind="error" message={t("status.error")} /> : null}
      {canDress ? (
        <View style={[styles.row, { gap: spacing.sm }]}>
          <View style={styles.flex}>
            <ButtonSecondary testID="dressme-shuffle" label={t("dressMe.shuffle")} onPress={shuffle} />
          </View>
          <View style={styles.flex}>
            <ButtonPrimary testID="dressme-save" label={savedId ? t("dressMe.saved") : t("dressMe.save")} onPress={() => void saveLook()} disabled={!!savedId} loading={saveState.isLoading} />
          </View>
        </View>
      ) : null}
      {savedId ? <ButtonSecondary testID="dressme-view" label={t("dressMe.view")} onPress={() => router.push(`/outfit/${savedId}`)} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center" }, flex: { flex: 1 } });
