import { useMemo, useState } from "react";
import { countByCategory, filterByCategory, searchItems, sortItems, type CategoryFilter, type ClosetSort } from "@/components/Closet/closetFilters";
import type { Item } from "@/services/api/types";

/** Client-side search → chip counts → category filter → sort for the Closet grid. */
export function useClosetFilters(items: Item[]) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<ClosetSort>("newest");

  const searched = useMemo(() => searchItems(items, query), [items, query]);
  const counts = useMemo(() => countByCategory(searched), [searched]);
  const visible = useMemo(() => sortItems(filterByCategory(searched, category), sort), [searched, category, sort]);

  return { query, setQuery, category, setCategory, sort, setSort, counts, visible };
}
