import { DRESS_CODE_RANGE } from './filters';
import { clamp, type EngineItem, type EngineProfile } from './types';

/** Tags a liked / disliked look contributes, derived from its items. */
export function tagsOfItems(items: Pick<EngineItem, 'starterKey' | 'subcategory' | 'primaryColor'>[]): string[] {
  const tags = new Set<string>();
  for (const i of items) {
    if (i.starterKey) tags.add(`key:${i.starterKey}`);
    tags.add(`sub:${i.subcategory}`);
    tags.add(`color:${i.primaryColor}`);
  }
  return [...tags];
}

export interface ProfileFitResult {
  score: number;
  outOfRange: number;
  likedHits: number;
  dislikedHits: number;
}

/** How well an outfit fits the dress code and the liked looks, 0–100. Pure. */
export function profileFit(items: EngineItem[], profile: EngineProfile): ProfileFitResult {
  const [lo, hi] = DRESS_CODE_RANGE[profile.dressCode];
  let score = 60;
  let outOfRange = 0;
  for (const i of items) {
    const dist = i.formality < lo ? lo - i.formality : i.formality > hi ? i.formality - hi : 0;
    if (dist > 0) {
      outOfRange++;
      score -= 15 * dist;
    }
  }

  let likedHits = 0;
  let dislikedHits = 0;
  for (const tag of tagsOfItems(items)) {
    if (profile.likedTags.has(tag)) likedHits++;
    if (profile.dislikedTags.has(tag)) dislikedHits++;
  }
  score += Math.min(4, likedHits) * 10;
  score -= Math.min(4, dislikedHits) * 8;

  return { score: clamp(score), outOfRange, likedHits, dislikedHits };
}
