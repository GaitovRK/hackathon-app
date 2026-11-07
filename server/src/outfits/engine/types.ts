import type { Color, DressCode, ItemCategory, Occasion, OutfitSlot, OutfitTemplate, Pattern, Season } from '@prisma/client';

/** The subset of `Item` the engine reads. Pure data: no Prisma client in the engine. */
export interface EngineItem {
  id: string;
  name: string;
  category: ItemCategory;
  subcategory: string;
  primaryColor: Color;
  secondaryColor: Color | null;
  pattern: Pattern;
  formality: number;
  warmth: number;
  seasons: Season[];
  occasions: Occasion[];
  starterKey: string | null;
}

export interface EngineProfile {
  dressCode: DressCode;
  /** Tags (starter keys, subcategories, colors) from liked onboarding looks. */
  likedTags: Set<string>;
  dislikedTags: Set<string>;
}

export interface WearHistory {
  /** Item ids worn on the day before `date`. */
  wornYesterday: Set<string>;
  /** Sorted-item-id keys (see `outfitKey`) of outfits worn in the recent window. */
  recentOutfitKeys: Set<string>;
  /** Times each item was worn in the recent window (missing = 0). */
  wearCount: Map<string, number>;
}

export interface EngineInput {
  items: EngineItem[];
  profile: EngineProfile;
  history: WearHistory;
  occasion: Occasion;
  season: Season;
  /** Outfit keys to avoid (e.g. the batch being refreshed). */
  excludeKeys?: Set<string>;
  /** Deterministic tie-breaking; a different seed gives a different (but still good) set. */
  seed?: number;
  count?: number;
}

export type SlotMap = Partial<Record<OutfitSlot, EngineItem>>;

export interface Candidate {
  template: OutfitTemplate;
  slots: SlotMap;
  items: EngineItem[];
}

export interface ScoreBreakdown {
  harmony: number;
  profile: number;
  history: number;
  total: number;
}

export interface Suggestion extends Candidate {
  score: ScoreBreakdown;
  reason: string;
}

export const outfitKey = (items: { id: string }[]): string =>
  items
    .map((i) => i.id)
    .sort()
    .join('+');

export const clamp = (n: number, lo = 0, hi = 100): number => Math.max(lo, Math.min(hi, n));
