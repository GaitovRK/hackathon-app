import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { ItemTile } from "@/components/Items/ItemTile";
import { Screen } from "@/components/Layout/Screen";
import { ItemTagSheet } from "@/components/Sheets/ItemTagSheet";
import { ItemMeter } from "@/components/Status/ItemMeter";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { t, type MessageKey } from "@/i18n/t";
import { CATEGORIES, type Item } from "@/services/api/types";
import { useAppSelector } from "@/store";
import { useArchiveItemMutation, useItemsQuery, useMeQuery, usePatchItemMutation } from "@/store/api";
import { useTheme } from "@/theme/useTheme";

/** Closet tab: "23 / 50" meter, then the item grid by category; tap an item to edit its tags. */
export default function ClosetScreen() {
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const ready = useAppSelector((s) => s.session.status === "ready");
  const items = useItemsQuery(undefined, { skip: !ready });
  const me = useMeQuery(undefined, { skip: !ready });
  const [patch, patchState] = usePatchItemMutation();
  const [archive] = useArchiveItemMutation();
  const [editing, setEditing] = useState<Item | null>(null);

  const groups = useMemo(() => CATEGORIES.map((c) => ({ category: c, items: (items.data ?? []).filter((i) => i.category === c) })).filter((g) => g.items.length), [items.data]);

  return (
    <Screen title={t("closet.title")}>
      <ItemMeter count={me.data?.itemCount ?? items.data?.length ?? 0} limit={me.data ? me.data.itemLimit : null} />
      <ButtonSecondary testID="closet-add" label={t("closet.addStarter")} onPress={() => router.push({ pathname: "/onboarding/closet", params: { mode: "add" } })} />
      {items.isLoading ? <StatusMessage kind="loading" message={t("status.loading")} /> : null}
      {items.isError ? <StatusMessage kind="error" message={t("status.error")} /> : null}
      {items.data?.length === 0 ? <StatusMessage kind="info" message={t("closet.empty")} /> : null}
      {groups.map((g) => (
        <View key={g.category} style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.foreground, fontSize: fontSize.lg, fontFamily: fontFamily.display }}>{t(`category.${g.category}` as MessageKey)}</Text>
          <View style={[styles.grid, { gap: spacing.sm }]}>
            {g.items.map((item) => (
              <ItemTile key={item.id} testID={`item-${item.id}`} garment={item} size={80} label onPress={() => setEditing(item)} />
            ))}
          </View>
        </View>
      ))}
      {editing ? (
        <ItemTagSheet
          key={editing.id}
          item={editing}
          saving={patchState.isLoading}
          onClose={() => setEditing(null)}
          onSave={(id, p) => void patch({ id, patch: p }).then(() => setEditing(null))}
          onArchive={(id) => void archive(id).then(() => setEditing(null))}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ grid: { flexDirection: "row", flexWrap: "wrap" } });
