import { router } from "expo-router";
import { useState } from "react";
import { ClosetView } from "@/components/Closet/ClosetView";
import { Screen } from "@/components/Layout/Screen";
import { ItemTagSheet } from "@/components/Sheets/ItemTagSheet";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { t } from "@/i18n/t";
import type { Item } from "@/services/api/types";
import { openAddPhoto } from "@/services/navigation/routes";
import { useAppSelector } from "@/store";
import { useArchiveItemMutation, useItemsQuery, useMeQuery, usePatchItemMutation } from "@/store/api";

/** Items waiting for a "mine?" check after photo import. Photo import hasn't shipped, so none yet (dev preview shows the chip). */
const ITEMS_TO_CHECK = 0;

/** Closet tab (option A "Wardrobe grid"); tap an item to edit its tags or archive it. */
export default function ClosetScreen() {
  const ready = useAppSelector((s) => s.session.status === "ready");
  const items = useItemsQuery(undefined, { skip: !ready });
  const me = useMeQuery(undefined, { skip: !ready });
  const [patch, patchState] = usePatchItemMutation();
  const [archive] = useArchiveItemMutation();
  const [editing, setEditing] = useState<Item | null>(null);

  return (
    <Screen>
      {items.isLoading ? <StatusMessage kind="loading" message={t("status.loading")} /> : null}
      {items.isError ? <StatusMessage kind="error" message={t("status.error")} /> : null}
      {items.data ? (
        <ClosetView
          items={items.data}
          itemCount={me.data?.itemCount ?? items.data.length}
          itemLimit={me.data?.itemLimit}
          toCheckCount={ITEMS_TO_CHECK}
          onOpenItem={setEditing}
          onAddBasics={() => router.push({ pathname: "/onboarding/closet", params: { mode: "add" } })}
          onAddPhoto={openAddPhoto}
        />
      ) : null}
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
