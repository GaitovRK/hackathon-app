import { filterWithRelaxation, type Relaxation } from './filters';
import { colorHarmony } from './harmony';
import { historyScore } from './history';
import { profileFit } from './profile';
import { TemplateReasonProvider, type ReasonProvider } from './reasons';
import { canFillAnyTemplate, COLD_SEASONS, enumerateBaseCandidates, groupByCategory, withSlot } from './templates';
import { outfitKey, type Candidate, type EngineInput, type EngineItem, type ScoreBreakdown, type Suggestion } from './types';

const WEIGHTS = { harmony: 0.4, profile: 0.3, history: 0.3 } as const;
const BASE_KEEP = 60;

export function scoreCandidate(c: Candidate, input: Pick<EngineInput, 'profile' | 'history'>): ScoreBreakdown {
  const harmony = colorHarmony(c.items).score;
  const profile = profileFit(c.items, input.profile).score;
  const history = historyScore(c.items, input.history).score;
  const total = Math.round(WEIGHTS.harmony * harmony + WEIGHTS.profile * profile + WEIGHTS.history * history);
  return { harmony, profile, history, total };
}

/** Small deterministic jitter so a refresh (new seed) reorders near-ties without breaking the ranking. */
function jitter(seed: number, key: string): number {
  let h = seed >>> 0;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 2654435761) >>> 0;
  return ((h % 1000) / 1000) * 4 - 2; // -2..+2 points
}

/** Order items so under-worn ones come first (and the slot caps keep variety). */
function rotate(items: EngineItem[], input: EngineInput): EngineItem[] {
  const seed = input.seed ?? 0;
  return [...items].sort((a, b) => {
    const wa = input.history.wearCount.get(a.id) ?? 0;
    const wb = input.history.wearCount.get(b.id) ?? 0;
    if (wa !== wb) return wa - wb;
    return jitter(seed, a.id) - jitter(seed, b.id);
  });
}

/**
 * Two outfits are distinct when they share at most `allowedShared` items: 1 for 3–4 piece outfits (the same
 * shoes are fine), 2 for 5 pieces (coat + belt may repeat, the core must change).
 */
export function isDistinct(a: Candidate, b: Candidate, allowedShared?: number): boolean {
  const ids = new Set(a.items.map((i) => i.id));
  const shared = b.items.filter((i) => ids.has(i.id)).length;
  const allowed = allowedShared ?? Math.floor((Math.min(a.items.length, b.items.length) - 1) / 2);
  return shared <= allowed && outfitKey(a.items) !== outfitKey(b.items);
}

export function pickDistinct(ranked: Candidate[], count: number): Candidate[] {
  const strict: Candidate[] = [];
  for (const c of ranked) {
    if (strict.every((s) => isDistinct(s, c))) strict.push(c);
    if (strict.length === count) return strict;
  }
  // Small closets: relax to "not the same set of items".
  const loose = [...strict];
  for (const c of ranked) {
    if (loose.length === count) break;
    if (loose.every((s) => outfitKey(s.items) !== outfitKey(c.items))) loose.push(c);
  }
  return loose;
}

export interface EngineResult {
  suggestions: Suggestion[];
  relaxation: Relaxation;
}

/**
 * Rules-first outfit suggestions: filter by season / occasion / dress code (relaxing when the closet is
 * small), enumerate templates, score (harmony + profile fit + wear history), layer outerwear when it is
 * cold and an accessory when it helps, then return the best distinct outfits with a one-line reason.
 */
export function suggestOutfits(input: EngineInput, reasons: ReasonProvider = new TemplateReasonProvider()): EngineResult {
  const count = input.count ?? 3;
  const { items, relaxation } = filterWithRelaxation(input.items, { occasion: input.occasion, dressCode: input.profile.dressCode, season: input.season }, canFillAnyTemplate);
  if (!canFillAnyTemplate(items)) return { suggestions: [], relaxation };

  const rotated = rotate(items, input);
  const seed = input.seed ?? 0;
  const scored = (c: Candidate) => ({ c, s: scoreCandidate(c, input), j: jitter(seed, outfitKey(c.items)) });
  const byTotal = (a: { s: ScoreBreakdown; j: number }, b: { s: ScoreBreakdown; j: number }) => b.s.total + b.j - (a.s.total + a.j);

  const base = enumerateBaseCandidates(rotated).map(scored).sort(byTotal).slice(0, BASE_KEEP);

  const by = groupByCategory(rotated);
  const extended = base.map(({ c }) => {
    let best = c;
    let bestScore = scoreCandidate(c, input).total;
    if (by.outerwear.length && COLD_SEASONS.has(input.season)) {
      // Cold: outerwear is mandatory, take the best-scoring one.
      let top: { c: Candidate; t: number } | null = null;
      for (const o of by.outerwear) {
        const next = withSlot(c, 'outerwear', o);
        const t = scoreCandidate(next, input).total;
        if (!top || t > top.t) top = { c: next, t };
      }
      if (top) {
        best = top.c;
        bestScore = top.t;
      }
    } else if (input.season !== 'summer') {
      // Spring: a layer only when it improves the look. Summer: no outerwear.
      for (const o of by.outerwear) {
        const next = withSlot(c, 'outerwear', o);
        const t = scoreCandidate(next, input).total;
        if (t > bestScore) {
          best = next;
          bestScore = t;
        }
      }
    }
    for (const a of by.accessory) {
      const next = withSlot(best, 'accessory', a);
      const t = scoreCandidate(next, input).total;
      if (t >= bestScore) {
        best = next;
        bestScore = t;
      }
    }
    return best;
  });

  const ranked = extended
    .map(scored)
    .filter(({ c }) => !input.excludeKeys?.has(outfitKey(c.items)))
    .sort(byTotal)
    .map(({ c }) => c);

  const picked = pickDistinct(ranked.length ? ranked : extended, count);
  const suggestions = picked.map((c) => {
    const score = scoreCandidate(c, input);
    return { ...c, score, reason: reasons.reason(c, { occasion: input.occasion, score }) };
  });
  return { suggestions, relaxation };
}
