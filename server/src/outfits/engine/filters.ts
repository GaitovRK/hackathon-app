import type { DressCode, Occasion, Season } from '@prisma/client';
import type { EngineItem } from './types';

/** Formality range (1–5) each dress code expects. */
export const DRESS_CODE_RANGE: Record<DressCode, [number, number]> = {
  formal: [4, 5],
  smart_casual: [3, 4],
  casual: [1, 3],
  creative: [2, 5],
};

/** Northern-hemisphere meteorological season for a date (UTC). */
export function seasonOf(date: Date): Season {
  const m = date.getUTCMonth();
  if (m <= 1 || m === 11) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'autumn';
}

export const matchesOccasion = (item: EngineItem, occasion: Occasion): boolean => item.occasions.includes(occasion);
export const matchesSeason = (item: EngineItem, season: Season): boolean => item.seasons.length === 0 || item.seasons.includes(season);

/** Within the dress code range, with one step of tolerance (a 2 is fine for smart casual, a 1 is not). */
export function matchesDressCode(item: EngineItem, dressCode: DressCode, tolerance = 1): boolean {
  const [lo, hi] = DRESS_CODE_RANGE[dressCode];
  return item.formality >= lo - tolerance && item.formality <= hi + tolerance;
}

export interface FilterOptions {
  occasion: Occasion;
  dressCode: DressCode;
  season: Season;
}

export type Relaxation = 'none' | 'season' | 'occasion' | 'formality';

const LADDER: Relaxation[] = ['none', 'season', 'occasion', 'formality'];

export function filterItems(items: EngineItem[], o: FilterOptions, relax: Relaxation = 'none'): EngineItem[] {
  const level = LADDER.indexOf(relax);
  return items.filter(
    (i) =>
      (level >= 1 || matchesSeason(i, o.season)) &&
      (level >= 2 || matchesOccasion(i, o.occasion)) &&
      (level >= 3 || matchesDressCode(i, o.dressCode)),
  );
}

/** Loosens filters step by step until `enough(items)` holds; returns the items and the level used. */
export function filterWithRelaxation(
  items: EngineItem[],
  o: FilterOptions,
  enough: (items: EngineItem[]) => boolean,
): { items: EngineItem[]; relaxation: Relaxation } {
  for (const relaxation of LADDER) {
    const filtered = filterItems(items, o, relaxation);
    if (enough(filtered)) return { items: filtered, relaxation };
  }
  return { items, relaxation: 'formality' };
}
