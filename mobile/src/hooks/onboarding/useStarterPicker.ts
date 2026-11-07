import { useEffect, useMemo } from "react";
import { looksFor } from "@/content/looks";
import { CATEGORIES, type ItemCategory, type StarterItem, type Wardrobe } from "@/services/api/types";
import { useAppDispatch, useAppSelector } from "@/store";
import { useStarterCatalogQuery } from "@/store/api";
import { starterToggled, startersSelected } from "@/store/onboardingSlice";

/** True when the keys can fill a template: top + bottom + shoes, or dress + shoes. */
export function canBuildOutfit(selected: string[], catalog: StarterItem[]): boolean {
  const cats = new Set(catalog.filter((s) => selected.includes(s.starterKey)).map((s) => s.category));
  return cats.has("shoes") && ((cats.has("top") && cats.has("bottom")) || cats.has("dress"));
}

/** Starter keys from the looks the user liked: the default selection, so "Build my outfits" is one tap away. */
export function defaultSelection(likedLookIds: string[], wardrobe: Wardrobe): string[] {
  const liked = new Set(likedLookIds);
  return [...new Set(looksFor(wardrobe).filter((l) => liked.has(l.id)).flatMap((l) => l.items.map((i) => i.starterKey)))];
}

const WARDROBE_RANK: Record<Wardrobe, number> = { womenswear: 0, both: 1, menswear: 2 };

/** Women first (decision #2): womenswear, then unisex, then menswear; stable within each. */
export function sortWomenswearFirst<T extends Pick<StarterItem, "wardrobe">>(items: T[]): T[] {
  return [...items].sort((a, b) => WARDROBE_RANK[a.wardrobe] - WARDROBE_RANK[b.wardrobe]);
}

/**
 * The starter closet picker state: catalog grouped by category for the wardrobe, selection in the
 * onboarding slice, pre-filled from liked looks once (`preselect`).
 */
export function useStarterPicker({ preselect }: { preselect: boolean }) {
  const dispatch = useAppDispatch();
  const ready = useAppSelector((s) => s.session.status === "ready");
  const { wardrobe, selectedStarterKeys, swipes } = useAppSelector((s) => s.onboarding);
  const catalog = useStarterCatalogQuery(undefined, { skip: !ready });
  const items = useMemo(() => sortWomenswearFirst((catalog.data?.items ?? []).filter((s) => wardrobe === "both" || s.wardrobe === "both" || s.wardrobe === wardrobe)), [catalog.data, wardrobe]);

  useEffect(() => {
    if (!preselect || selectedStarterKeys.length > 0 || items.length === 0) return;
    const liked = swipes.filter((s) => s.liked).map((s) => s.lookId);
    const keys = defaultSelection(liked, wardrobe).filter((k) => items.some((i) => i.starterKey === k));
    if (keys.length) dispatch(startersSelected(keys));
  }, [dispatch, items, preselect, selectedStarterKeys.length, swipes, wardrobe]);

  const groups = useMemo(
    () => CATEGORIES.map((category) => ({ category, items: items.filter((i) => i.category === category) })).filter((g) => g.items.length > 0),
    [items],
  );

  return {
    groups: groups as { category: ItemCategory; items: StarterItem[] }[],
    selected: selectedStarterKeys,
    toggle: (key: string) => dispatch(starterToggled(key)),
    canBuild: canBuildOutfit(selectedStarterKeys, items),
    loading: catalog.isLoading,
    error: catalog.isError,
  };
}
