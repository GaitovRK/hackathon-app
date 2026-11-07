import type { DressCode, ItemCategory, OutfitSlot, OutfitTemplate } from '@prisma/client';
import { z } from 'zod';
import type { EngineProfile, Suggestion } from './engine/types';

/**
 * Pure rules for `POST /outfits/ideas` (board screen 05 → 06): the quick-questions brief → engine profile,
 * and the free / pro split of the engine's suggestions. No Prisma, no env: the service injects both.
 */

export const OCCASIONS = ['work', 'friends', 'date', 'event', 'casual', 'sport', 'travel'] as const;
export const VIBES = ['sharp', 'relaxed', 'bold'] as const;
export type Vibe = (typeof VIBES)[number];

export const ideasBodySchema = z.object({
  occasion: z.enum(OCCASIONS),
  vibe: z.enum(VIBES),
  /** 1 easy … 5 formal (board: "4 · Smart"). */
  formality: z.number().int().min(1).max(5),
  /** The user's local calendar day (YYYY-MM-DD), for the season and wear history; defaults to today in UTC. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
export type IdeasBody = z.infer<typeof ideasBodySchema>;

export const saveManySchema = z.object({
  occasion: z.enum(OCCASIONS).default('work'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ideas: z
    .array(
      z.object({
        template: z.enum(['separates', 'separates_layered', 'dress', 'dress_layered']),
        itemIds: z.array(z.string().uuid()).min(2).max(6),
      }),
    )
    .min(1)
    .max(12),
});
export type SaveManyBody = z.infer<typeof saveManySchema>;

/** Formality 1–5 → the dress code whose range (see `DRESS_CODE_RANGE`) it falls in. */
export function dressCodeForFormality(formality: number): DressCode {
  if (formality >= 5) return 'formal';
  if (formality >= 3) return 'smart_casual';
  return 'casual';
}

/** Tags (see `tagsOfItems`) each vibe pulls towards / away from. */
export const VIBE_TAGS: Record<Vibe, { liked: string[]; disliked: string[] }> = {
  sharp: {
    liked: ['sub:blazer', 'sub:shirt', 'sub:blouse', 'sub:trousers', 'sub:loafers', 'sub:oxfords', 'sub:heels', 'sub:coat', 'sub:trench', 'color:navy', 'color:black', 'color:white'],
    disliked: ['sub:hoodie', 'sub:joggers'],
  },
  relaxed: {
    liked: ['sub:knit', 'sub:tshirt', 'sub:turtleneck', 'sub:hoodie', 'sub:jeans', 'sub:joggers', 'sub:chinos', 'sub:sneakers'],
    disliked: ['sub:blazer', 'sub:heels', 'sub:oxfords'],
  },
  bold: {
    liked: ['color:red', 'color:burgundy', 'color:pink', 'color:green', 'color:yellow', 'color:orange', 'color:purple', 'color:blue'],
    disliked: ['color:grey', 'color:beige'],
  },
};

/** The onboarding profile adjusted by the quick answers: formality sets the dress code, the vibe adds tags. */
export function applyBrief(profile: EngineProfile, brief: Pick<IdeasBody, 'vibe' | 'formality'>): EngineProfile {
  const vibe = VIBE_TAGS[brief.vibe];
  const likedTags = new Set([...profile.likedTags, ...vibe.liked]);
  const dislikedTags = new Set([...profile.dislikedTags].filter((t) => !vibe.liked.includes(t)));
  for (const t of vibe.disliked) if (!likedTags.has(t)) dislikedTags.add(t);
  return { dressCode: dressCodeForFormality(brief.formality), likedTags, dislikedTags };
}

export interface IdeaSlot<TItem> {
  slot: OutfitSlot;
  item: TItem;
}

/** An idea the user may see in full. `key` is the sorted item-id key; nothing is persisted until saved. */
export interface Idea<TItem> {
  key: string;
  template: OutfitTemplate;
  score: number;
  reason: string;
  items: IdeaSlot<TItem>[];
}

/** A Pro-only idea as seen by a Free user: just enough to draw a grey silhouette. No ids, names or colors. */
export interface LockedIdea {
  key: string;
  template: OutfitTemplate;
  slots: { slot: OutfitSlot; category: ItemCategory; subcategory: string }[];
}

export interface SplitLimits {
  isPro: boolean;
  freeVisible: number;
  proMax: number;
}

export interface SplitResult<TItem> {
  ideas: Idea<TItem>[];
  locked: LockedIdea[];
  lockedCount: number;
}

export const toIdea = <TItem>(s: Suggestion, itemOf: (id: string) => TItem): Idea<TItem> => ({
  key: s.items
    .map((i) => i.id)
    .sort()
    .join('+'),
  template: s.template,
  score: s.score.total,
  reason: s.reason,
  items: Object.entries(s.slots).map(([slot, item]) => ({ slot: slot as OutfitSlot, item: itemOf(item.id) })),
});

export const toLocked = (s: Suggestion, index: number): LockedIdea => ({
  key: `locked-${index + 1}`,
  template: s.template,
  slots: Object.entries(s.slots).map(([slot, item]) => ({ slot: slot as OutfitSlot, category: item.category, subcategory: item.subcategory })),
});

/**
 * Pro sees up to `proMax` ideas. Free sees the first `freeVisible` in full and the rest as locked
 * silhouettes (`lockedCount` drives "Unlock N more"); locked ideas never carry item ids.
 */
export function splitIdeas<TItem>(suggestions: Suggestion[], limits: SplitLimits, itemOf: (id: string) => TItem): SplitResult<TItem> {
  const all = suggestions.slice(0, limits.proMax);
  if (limits.isPro) return { ideas: all.map((s) => toIdea(s, itemOf)), locked: [], lockedCount: 0 };
  const visible = all.slice(0, limits.freeVisible);
  const rest = all.slice(limits.freeVisible);
  return { ideas: visible.map((s) => toIdea(s, itemOf)), locked: rest.map(toLocked), lockedCount: rest.length };
}
