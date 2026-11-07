import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { ChipRow } from "@/components/Chips/ChipRow";
import { TextField } from "@/components/Inputs/TextField";
import { ItemTile } from "@/components/Items/ItemTile";
import { Screen } from "@/components/Layout/Screen";
import { FlowHeader } from "@/components/Outfit/FlowHeader";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { useAddPhoto } from "@/hooks/closet/useAddPhoto";
import { t, type MessageKey } from "@/i18n/t";
import { openAddItems } from "@/services/navigation/routes";
import { CATEGORIES, GARMENT_COLORS, type GarmentColor, type Item, type ItemCategory } from "@/services/api/types";
import { usePatchItemMutation } from "@/store/api";
import { displayStyle, useTheme } from "@/theme/useTheme";

/** Add your own clothes (#21): take / choose a photo → server cuts it out + tags it → result card with quick fixes. */
export default function AddPhotoScreen() {
  const { colors, spacing, fontSize, fontFamily, radius } = useTheme();
  const { state, pick, retry, reset, updateItem } = useAddPhoto();

  return (
    <Screen>
      <FlowHeader title={t("addPhoto.header")} />
      {state.step === "idle" ? (
        <View testID="add-photo-pick" style={{ gap: spacing.md }}>
          <Text accessibilityRole="header" style={displayStyle(fontSize.xxl, colors.ink)}>
            {t("addPhoto.title")}
          </Text>
          <Text style={{ color: colors.ink2, fontSize: fontSize.md, fontFamily: fontFamily.body }}>{t("addPhoto.subtitle")}</Text>
          {state.notice ? <StatusMessage kind="error" message={t(`addPhoto.${state.notice}`)} /> : null}
          <ButtonPrimary testID="add-photo-camera" label={t("addPhoto.takePhoto")} onPress={() => void pick("camera")} />
          <ButtonSecondary testID="add-photo-library" label={t("addPhoto.chooseLibrary")} onPress={() => void pick("library")} />
          <ButtonSecondary testID="add-photo-basics" label={t("addPhoto.addBasics")} onPress={openAddItems} />
        </View>
      ) : null}

      {state.step === "processing" ? (
        <View testID="add-photo-processing" style={[styles.processing, { backgroundColor: colors.lilac2, borderRadius: radius.card, padding: spacing.xl, gap: spacing.md }]}>
          <ActivityIndicator color={colors.ink} size="large" />
          <Text style={displayStyle(fontSize.xl + 7, colors.ink)}>{t(state.phase === "cutting" ? "addPhoto.cutting" : "addPhoto.tagging")}</Text>
          <Text style={{ color: colors.ink2, fontSize: fontSize.sm, fontFamily: fontFamily.body }}>{t("addPhoto.processingHint")}</Text>
        </View>
      ) : null}

      {state.step === "failed" ? (
        <View testID="add-photo-failed" style={{ gap: spacing.md }}>
          <Text style={displayStyle(fontSize.xl + 7, colors.ink)}>{t("addPhoto.failedTitle")}</Text>
          <StatusMessage kind="info" message={t("addPhoto.failedBody")} />
          <ButtonPrimary testID="add-photo-retry" label={t("addPhoto.tryAgain")} onPress={() => void retry()} />
          <ButtonSecondary label={t("common.close")} onPress={reset} />
        </View>
      ) : null}

      {state.step === "result" ? <ResultCard key={state.item.id} item={state.item} tagged={state.tagged} onSaved={updateItem} onAddAnother={reset} /> : null}
    </Screen>
  );
}

type ResultProps = { item: Item; tagged: boolean; onSaved: (item: Item) => void; onAddAnother: () => void };

/** The cutout on a mist tile + name, category and colour; "Looks wrong? Fix it" edits inline and PATCHes. */
function ResultCard({ item, tagged, onSaved, onAddAnother }: ResultProps) {
  const { colors, spacing, fontSize, fontFamily, radius } = useTheme();
  const [patchItem, { isLoading: saving }] = usePatchItemMutation();
  const [editing, setEditing] = useState(!tagged);
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<ItemCategory>(item.category);
  const [primaryColor, setPrimaryColor] = useState<GarmentColor>(item.primaryColor);
  const section = (key: MessageKey) => <Text style={{ color: colors.ink2, fontSize: fontSize.sm, fontFamily: fontFamily.bodySemibold }}>{t(key)}</Text>;

  const save = async () => {
    const res = await patchItem({ id: item.id, patch: { name: name.trim() || item.name, category, primaryColor } });
    if ("data" in res && res.data) {
      onSaved(res.data);
      setEditing(false);
    }
  };

  return (
    <View testID="add-photo-result" style={{ gap: spacing.lg }}>
      <View style={[styles.center, { backgroundColor: colors.mist, borderRadius: radius.card, padding: spacing.lg, gap: spacing.sm }]}>
        <ItemTile garment={{ ...item, name, category, primaryColor }} size={200} />
        <Text testID="add-photo-name" style={displayStyle(fontSize.xl + 7, colors.ink)}>
          {name}
        </Text>
        <Text style={{ color: colors.ink2, fontSize: fontSize.sm, fontFamily: fontFamily.bodySemibold }}>
          {tagged ? `${t("addPhoto.added")} · ${t(`category.${category}` as MessageKey)} · ${t(`color.${primaryColor}` as MessageKey)}` : t("addPhoto.untagged")}
        </Text>
      </View>

      {editing ? (
        <View testID="add-photo-edit" style={{ gap: spacing.md }}>
          {tagged ? null : <StatusMessage kind="info" message={t("addPhoto.untagged")} />}
          {section("closet.name")}
          <TextField testID="add-photo-edit-name" value={name} onChangeText={setName} placeholder={t("closet.name")} />
          {section("addPhoto.category")}
          <ChipRow testID="add-photo-category" options={CATEGORIES.map((c) => ({ value: c, label: t(`category.${c}` as MessageKey) }))} value={category} onChange={setCategory} />
          {section("closet.color")}
          <ChipRow testID="add-photo-color" options={GARMENT_COLORS.map((c) => ({ value: c, label: t(`color.${c}` as MessageKey) }))} value={primaryColor} onChange={setPrimaryColor} />
          <ButtonPrimary testID="add-photo-save" label={t("addPhoto.save")} loading={saving} onPress={() => void save()} />
        </View>
      ) : (
        <ButtonSecondary testID="add-photo-fix" label={t("addPhoto.fixIt")} onPress={() => setEditing(true)} />
      )}

      <ButtonSecondary testID="add-photo-another" label={t("addPhoto.addAnother")} onPress={onAddAnother} />
      <ButtonPrimary testID="add-photo-done" label={t("addPhoto.done")} onPress={() => router.replace("/closet")} />
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: "center" }, processing: { alignItems: "center" } });
