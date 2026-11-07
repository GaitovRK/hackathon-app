import { t, type MessageKey } from "@/i18n/t";
import { CATEGORIES, type GarmentColor, type Item, type ItemCategory } from "@/services/api/types";

/** Closet filters run on the client: a closet holds at most a few hundred items. */
export type CategoryFilter = "all" | ItemCategory;
export type ClosetSort = "newest" | "category" | "color";

export const CATEGORY_FILTERS: CategoryFilter[] = ["all", ...CATEGORIES];
export const CLOSET_SORTS: ClosetSort[] = ["newest", "category", "color"];

/** Wardrobe order for "sort by color": light neutrals → dark neutrals → hues. */
export const COLOR_ORDER: GarmentColor[] = [
  "white", "cream", "beige", "camel", "brown", "grey", "black", "navy", "blue", "light_blue",
  "green", "olive", "yellow", "orange", "red", "pink", "burgundy", "purple",
];

export const categoryFilterLabel = (c: CategoryFilter) => t(`closet.filter.${c}` as MessageKey);
export const sortLabel = (s: ClosetSort) => t(`closet.sort.${s}` as MessageKey);

const colorLabel = (c: GarmentColor | null | undefined) => (c ? t(`color.${c}` as MessageKey) : "");

/** Everything a search term can hit: name, type, colors, category, material, pattern. */
function haystack(item: Item): string {
  return [
    item.name,
    item.subcategory,
    colorLabel(item.primaryColor),
    colorLabel(item.secondaryColor),
    t(`category.${item.category}` as MessageKey),
    categoryFilterLabel(item.category),
    item.material ?? "",
    item.pattern,
  ]
    .join(" ")
    .toLowerCase();
}

/** Every word of the query must match (`black linen` → black items made of linen). Empty query → all items. */
export function searchItems(items: Item[], query: string): Item[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return items;
  return items.filter((item) => {
    const text = haystack(item);
    return words.every((w) => text.includes(w));
  });
}

export function filterByCategory(items: Item[], category: CategoryFilter): Item[] {
  return category === "all" ? items : items.filter((i) => i.category === category);
}

/** Chip counts: `all` plus one per category. */
export function countByCategory(items: Item[]): Record<CategoryFilter, number> {
  const counts = Object.fromEntries(CATEGORY_FILTERS.map((c) => [c, 0])) as Record<CategoryFilter, number>;
  for (const item of items) {
    counts.all += 1;
    counts[item.category] += 1;
  }
  return counts;
}

const newestFirst = (a: Item, b: Item) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name);
const rank = <T,>(list: readonly T[], value: T) => {
  const i = list.indexOf(value);
  return i === -1 ? list.length : i;
};

export function sortItems(items: Item[], sort: ClosetSort): Item[] {
  const sorted = [...items];
  if (sort === "newest") return sorted.sort(newestFirst);
  if (sort === "category") return sorted.sort((a, b) => rank(CATEGORIES, a.category) - rank(CATEGORIES, b.category) || newestFirst(a, b));
  return sorted.sort((a, b) => rank(COLOR_ORDER, a.primaryColor) - rank(COLOR_ORDER, b.primaryColor) || rank(CATEGORIES, a.category) - rank(CATEGORIES, b.category) || newestFirst(a, b));
}
