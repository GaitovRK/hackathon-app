import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { ChipRow } from "@/components/Chips/ChipRow";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { useClosetFilters } from "@/hooks/closet/useClosetFilters";
import { t } from "@/i18n/t";
import type { Item } from "@/services/api/types";
import { displayStyle, useTheme } from "@/theme/useTheme";
import { CategoryChips } from "./CategoryChips";
import { ChevronIcon } from "./ClosetIcons";
import { ClosetGrid } from "./ClosetGrid";
import { ClosetMeter } from "./ClosetMeter";
import { ClosetSearchBar } from "./ClosetSearchBar";
import { CLOSET_SORTS, sortLabel } from "./closetFilters";
import { NewItemsChip } from "./NewItemsChip";

type Props = {
  items: Item[];
  itemCount: number;
  /** null = Pro (unlimited); undefined = `/me` not loaded yet (meter hidden). */
  itemLimit: number | null | undefined;
  /** Items from photo import that still need a look; 0 hides the chip. */
  toCheckCount: number;
  onOpenItem: (item: Item) => void;
  onAddBasics: () => void;
  /** Add your own clothes from a photo (#21); omitted = only "Add basics". */
  onAddPhoto?: () => void;
  onCheckNew?: () => void;
};

/**
 * Closet option A "Wardrobe grid": title + item meter, search + sort, category chips with counts,
 * sort label + "N new items to check", then a 3-column cutout grid. Presentational; the tab screen loads data.
 */
export function ClosetView({ items, itemCount, itemLimit, toCheckCount, onOpenItem, onAddBasics, onAddPhoto, onCheckNew }: Props) {
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { query, setQuery, category, setCategory, sort, setSort, counts, visible } = useClosetFilters(items);
  const [sortOpen, setSortOpen] = useState(false);
  const toggleSort = () => setSortOpen((o) => !o);
  const addPhoto = onAddPhoto ? <ButtonPrimary testID="closet-add-photo" label={t("addPhoto.closetAction")} onPress={onAddPhoto} /> : null;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={displayStyle(fontSize.display - 4, colors.foreground)}>
          {t("closet.title")}
        </Text>
        {itemLimit !== undefined ? <ClosetMeter count={itemCount} limit={itemLimit} /> : null}
      </View>

      {items.length === 0 ? (
        <View testID="closet-empty" style={{ gap: spacing.md }}>
          <StatusMessage kind="info" message={t("closet.empty")} />
          {addPhoto}
          <ButtonPrimary testID="closet-add-basics" label={t("closet.addStarter")} onPress={onAddBasics} />
        </View>
      ) : (
        <>
          <ClosetSearchBar query={query} onQueryChange={setQuery} sortOpen={sortOpen} onToggleSort={toggleSort} />
          {sortOpen ? (
            <ChipRow
              testID="closet-sort"
              options={CLOSET_SORTS.map((s) => ({ value: s, label: sortLabel(s) }))}
              value={sort}
              onChange={(s) => {
                setSort(s);
                setSortOpen(false);
              }}
            />
          ) : null}
          <CategoryChips value={category} counts={counts} onChange={setCategory} />
          <View style={styles.between}>
            <Pressable testID="closet-sort-label" accessibilityRole="button" onPress={toggleSort} style={[styles.row, { gap: spacing.xs }]}>
              <Text style={{ color: colors.muted, fontSize: fontSize.sm - 1, fontFamily: fontFamily.bodySemibold }}>{sortLabel(sort)}</Text>
              <ChevronIcon color={colors.muted} down />
            </Pressable>
            <NewItemsChip count={toCheckCount} onPress={onCheckNew} />
          </View>
          {visible.length ? (
            <ClosetGrid items={visible} onOpenItem={onOpenItem} />
          ) : (
            <StatusMessage kind="info" message={t("closet.noMatches")} />
          )}
          {addPhoto}
          <ButtonSecondary testID="closet-add" label={t("closet.addStarter")} onPress={onAddBasics} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 32 },
  row: { flexDirection: "row", alignItems: "center" },
});
