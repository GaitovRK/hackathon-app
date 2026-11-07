import { clamp, outfitKey, type EngineItem, type WearHistory } from './types';

export interface HistoryResult {
  score: number;
  repeatsYesterday: number;
  sameOutfitRecently: boolean;
  freshItems: number;
}

/** Wear-history score, 0–100: no repeats from yesterday, rotate under-worn items. Pure. */
export function historyScore(items: EngineItem[], history: WearHistory): HistoryResult {
  let score = 80;
  const repeatsYesterday = items.filter((i) => history.wornYesterday.has(i.id)).length;
  score -= 30 * repeatsYesterday;

  const sameOutfitRecently = history.recentOutfitKeys.has(outfitKey(items));
  if (sameOutfitRecently) score -= 60;

  const freshItems = items.filter((i) => (history.wearCount.get(i.id) ?? 0) === 0).length;
  score += Math.min(4, freshItems) * 5;
  const heavy = items.filter((i) => (history.wearCount.get(i.id) ?? 0) >= 3).length;
  score -= heavy * 5;

  return { score: clamp(score), repeatsYesterday, sameOutfitRecently, freshItems };
}

export const emptyHistory = (): WearHistory => ({ wornYesterday: new Set(), recentOutfitKeys: new Set(), wearCount: new Map() });
