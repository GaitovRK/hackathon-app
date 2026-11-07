import { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { ChipRow } from "@/components/Chips/ChipRow";
import { TextField } from "@/components/Inputs/TextField";
import { ItemTile } from "@/components/Items/ItemTile";
import { t, type MessageKey } from "@/i18n/t";
import { GARMENT_COLORS, OCCASIONS, type GarmentColor, type Item, type ItemPatch, type Occasion } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";

type Props = {
  item: Item | null;
  onClose: () => void;
  onSave: (id: string, patch: ItemPatch) => void;
  onArchive: (id: string) => void;
  saving?: boolean;
};

const LEVELS = ["1", "2", "3", "4", "5"] as const;

/** Bottom sheet (modal) to edit an item's tags: name, color, formality, warmth, occasions; archive. */
export function ItemTagSheet({ item, onClose, onSave, onArchive, saving = false }: Props) {
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const [name, setName] = useState(item?.name ?? "");
  const [primaryColor, setPrimaryColor] = useState<GarmentColor>(item?.primaryColor ?? "grey");
  const [formality, setFormality] = useState(item?.formality ?? 3);
  const [warmth, setWarmth] = useState(item?.warmth ?? 3);
  const [occasions, setOccasions] = useState<Occasion[]>(item?.occasions ?? []);
  if (!item) return null;

  const section = (label: string) => <Text style={{ color: colors.muted, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{label}</Text>;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
          <View style={styles.center}>
            <ItemTile garment={{ ...item, name, primaryColor }} size={120} />
          </View>
          {section(t("closet.name"))}
          <TextField testID="tag-name" value={name} onChangeText={setName} placeholder={t("closet.name")} />
          {section(t("closet.color"))}
          <ChipRow testID="tag-color" options={GARMENT_COLORS.map((c) => ({ value: c, label: t(`color.${c}` as MessageKey) }))} value={primaryColor} onChange={setPrimaryColor} />
          {section(t("closet.formality"))}
          <ChipRow testID="tag-formality" options={LEVELS.map((v) => ({ value: v, label: v }))} value={String(formality) as (typeof LEVELS)[number]} onChange={(v) => setFormality(Number(v))} />
          {section(t("closet.warmth"))}
          <ChipRow testID="tag-warmth" options={LEVELS.map((v) => ({ value: v, label: v }))} value={String(warmth) as (typeof LEVELS)[number]} onChange={(v) => setWarmth(Number(v))} />
          {section(t("closet.occasions"))}
          <ChipRow
            testID="tag-occasion"
            options={OCCASIONS.map((o) => ({ value: o, label: t(`occasion.${o}` as MessageKey) }))}
            value={occasions}
            onChange={(o) => setOccasions((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]))}
          />
          <ButtonPrimary testID="tag-save" label={t("closet.saveTags")} loading={saving} onPress={() => onSave(item.id, { name: name.trim() || item.name, primaryColor, formality, warmth, occasions })} />
          <ButtonSecondary testID="tag-archive" label={t("closet.archive")} onPress={() => onArchive(item.id)} />
          <ButtonSecondary testID="tag-close" label={t("common.close")} onPress={onClose} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 }, center: { alignItems: "center" } });
