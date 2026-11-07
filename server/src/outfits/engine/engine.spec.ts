import { STARTER_CATALOG, type StarterItem } from '../../starter-catalog/catalog';
import { isDistinct, pickDistinct, scoreCandidate, suggestOutfits } from './engine';
import { DRESS_CODE_RANGE, filterItems, filterWithRelaxation, matchesDressCode, seasonOf } from './filters';
import { colorHarmony } from './harmony';
import { emptyHistory, historyScore } from './history';
import { profileFit, tagsOfItems } from './profile';
import { TemplateReasonProvider } from './reasons';
import { canFillAnyTemplate, enumerateBaseCandidates, withSlot } from './templates';
import { outfitKey, type Candidate, type EngineItem, type EngineProfile } from './types';

const toItem = (s: StarterItem, id = s.starterKey): EngineItem => ({
  id,
  name: s.name,
  category: s.category,
  subcategory: s.subcategory,
  primaryColor: s.primaryColor,
  secondaryColor: s.secondaryColor ?? null,
  pattern: s.pattern,
  formality: s.formality,
  warmth: s.warmth,
  seasons: s.seasons,
  occasions: s.occasions,
  starterKey: s.starterKey,
});

const byKey = (key: string): EngineItem => {
  const s = STARTER_CATALOG.find((x) => x.starterKey === key);
  if (!s) throw new Error(`missing starter ${key}`);
  return toItem(s);
};
const pick = (...keys: string[]) => keys.map(byKey);
const CLOSET = STARTER_CATALOG.map((s) => toItem(s));
const profile = (over: Partial<EngineProfile> = {}): EngineProfile => ({ dressCode: 'smart_casual', likedTags: new Set(), dislikedTags: new Set(), ...over });
const cand = (items: EngineItem[]): Candidate => ({ template: 'separates', slots: Object.fromEntries(items.map((i) => [i.category, i])), items });

describe('filters', () => {
  it('maps months to seasons', () => {
    expect(seasonOf(new Date('2026-01-15'))).toBe('winter');
    expect(seasonOf(new Date('2026-04-15'))).toBe('spring');
    expect(seasonOf(new Date('2026-07-15'))).toBe('summer');
    expect(seasonOf(new Date('2026-11-07'))).toBe('autumn');
    expect(seasonOf(new Date('2026-12-07'))).toBe('winter');
  });

  it('matches dress code with one step of tolerance', () => {
    expect(DRESS_CODE_RANGE.formal).toEqual([4, 5]);
    expect(matchesDressCode(byKey('white-tee'), 'formal')).toBe(false); // 1 vs 4-5
    expect(matchesDressCode(byKey('navy-chinos'), 'formal')).toBe(true); // 3 within tolerance
    expect(matchesDressCode(byKey('black-tailored-trousers'), 'casual')).toBe(false); // 5 vs 1-3
  });

  it('filters by season, occasion and dress code', () => {
    const work = filterItems(CLOSET, { occasion: 'work', dressCode: 'formal', season: 'summer' });
    expect(work.every((i) => i.occasions.includes('work'))).toBe(true);
    expect(work.every((i) => i.seasons.includes('summer'))).toBe(true);
    expect(work.find((i) => i.id === 'camel-coat')).toBeUndefined(); // winter only
    expect(work.find((i) => i.id === 'grey-hoodie')).toBeUndefined(); // casual
  });

  it('relaxes season, then occasion, then formality until a template fits', () => {
    const tiny = pick('grey-hoodie', 'black-joggers', 'running-shoes'); // sport-only, formality 1
    const r = filterWithRelaxation(tiny, { occasion: 'work', dressCode: 'formal', season: 'summer' }, canFillAnyTemplate);
    expect(r.relaxation).toBe('formality');
    expect(r.items).toHaveLength(3);
    const ok = filterWithRelaxation(CLOSET, { occasion: 'work', dressCode: 'smart_casual', season: 'autumn' }, canFillAnyTemplate);
    expect(ok.relaxation).toBe('none');
  });
});

describe('templates', () => {
  it('enumerates separates and dress combinations', () => {
    const items = pick('white-oxford-shirt', 'navy-knit', 'navy-chinos', 'brown-loafers', 'white-sneakers', 'black-midi-dress');
    const base = enumerateBaseCandidates(items);
    const separates = base.filter((c) => c.template === 'separates');
    const dresses = base.filter((c) => c.template === 'dress');
    expect(separates).toHaveLength(2 * 1 * 2);
    expect(dresses).toHaveLength(1 * 2);
    expect(separates[0].slots.top).toBeDefined();
    expect(separates[0].slots.bottom).toBeDefined();
    expect(separates[0].slots.shoes).toBeDefined();
  });

  it('cannot fill a template without shoes', () => {
    expect(canFillAnyTemplate(pick('white-oxford-shirt', 'navy-chinos'))).toBe(false);
    expect(canFillAnyTemplate(pick('black-midi-dress', 'black-heels'))).toBe(true);
  });

  it('layering outerwear switches to the layered template', () => {
    const c = enumerateBaseCandidates(pick('white-oxford-shirt', 'navy-chinos', 'brown-loafers'))[0];
    const layered = withSlot(c, 'outerwear', byKey('navy-blazer'));
    expect(layered.template).toBe('separates_layered');
    expect(layered.items).toHaveLength(4);
    expect(c.items).toHaveLength(3); // original untouched
  });
});

describe('color harmony', () => {
  it('rewards classic neutral pairings', () => {
    const r = colorHarmony(pick('navy-knit', 'grey-wool-trousers', 'brown-boots', 'camel-coat'));
    expect(r.goodPairs).toContain('camel|navy');
    expect(r.allNeutral).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(80);
  });

  it('penalises more than one loud color', () => {
    const red = { ...byKey('white-tee'), id: 'red-tee', primaryColor: 'red' as const };
    const green = { ...byKey('navy-chinos'), id: 'green-chinos', primaryColor: 'green' as const };
    const r = colorHarmony([red, green, byKey('white-sneakers')]);
    expect(r.loudCount).toBe(2);
    expect(r.clashes).toContain('green|red');
    expect(r.score).toBeLessThan(colorHarmony([red, byKey('navy-chinos'), byKey('white-sneakers')]).score);
  });

  it('penalises pattern clash', () => {
    const check = { ...byKey('navy-chinos'), id: 'check-trousers', pattern: 'check' as const };
    const clash = colorHarmony([byKey('striped-shirt'), check, byKey('brown-loafers')]);
    const clean = colorHarmony([byKey('striped-shirt'), byKey('navy-chinos'), byKey('brown-loafers')]);
    expect(clash.patternClash).toBe(true);
    expect(clash.score).toBeLessThan(clean.score);
  });
});

describe('profile fit', () => {
  it('derives tags from items', () => {
    expect(tagsOfItems(pick('navy-chinos'))).toEqual(['key:navy-chinos', 'sub:chinos', 'color:navy']);
  });

  it('prefers outfits in the dress code range and with liked tags', () => {
    const office = pick('white-oxford-shirt', 'navy-chinos', 'brown-loafers');
    const gym = pick('grey-hoodie', 'black-joggers', 'running-shoes');
    expect(profileFit(office, profile()).score).toBeGreaterThan(profileFit(gym, profile()).score);
    const liked = profile({ likedTags: new Set(['key:navy-chinos', 'sub:loafers']) });
    expect(profileFit(office, liked).likedHits).toBe(2);
    expect(profileFit(office, liked).score).toBeGreaterThan(profileFit(office, profile()).score);
    const disliked = profile({ dislikedTags: new Set(['color:navy']) });
    expect(profileFit(office, disliked).score).toBeLessThan(profileFit(office, profile()).score);
  });
});

describe('wear history', () => {
  const office = pick('white-oxford-shirt', 'navy-chinos', 'brown-loafers');

  it('penalises items worn yesterday and identical recent outfits', () => {
    const fresh = historyScore(office, emptyHistory());
    const h = emptyHistory();
    h.wornYesterday.add('navy-chinos');
    expect(historyScore(office, h).repeatsYesterday).toBe(1);
    expect(historyScore(office, h).score).toBeLessThan(fresh.score);
    h.recentOutfitKeys.add(outfitKey(office));
    expect(historyScore(office, h).sameOutfitRecently).toBe(true);
    expect(historyScore(office, h).score).toBeLessThan(40);
  });

  it('rewards under-worn items', () => {
    const h = emptyHistory();
    h.wearCount.set('white-oxford-shirt', 3);
    h.wearCount.set('navy-chinos', 3);
    h.wearCount.set('brown-loafers', 3);
    expect(historyScore(office, h).score).toBeLessThan(historyScore(office, emptyHistory()).score);
  });
});

describe('distinctness', () => {
  const a = cand(pick('white-oxford-shirt', 'navy-chinos', 'brown-loafers'));
  const b = cand(pick('light-blue-shirt', 'beige-chinos', 'brown-loafers'));
  const c = cand(pick('white-oxford-shirt', 'navy-chinos', 'white-sneakers'));

  it('allows one shared item but not two', () => {
    expect(isDistinct(a, b)).toBe(true);
    expect(isDistinct(a, c)).toBe(false);
    expect(isDistinct(a, a)).toBe(false);
  });

  it('picks distinct outfits first and falls back to non-identical ones for tiny closets', () => {
    expect(pickDistinct([a, c, b], 2).map((x) => outfitKey(x.items))).toEqual([outfitKey(a.items), outfitKey(b.items)]);
    expect(pickDistinct([a, c], 2)).toHaveLength(2);
    expect(pickDistinct([a, a], 2)).toHaveLength(1);
  });
});

describe('suggestOutfits', () => {
  const input = { items: CLOSET, profile: profile(), history: emptyHistory(), occasion: 'work' as const, season: 'autumn' as const };

  it('returns 3 distinct, scored, complete outfits with a reason', () => {
    const { suggestions, relaxation } = suggestOutfits(input);
    expect(relaxation).toBe('none');
    expect(suggestions).toHaveLength(3);
    for (const s of suggestions) {
      expect(s.items.length).toBeGreaterThanOrEqual(3);
      expect(s.slots.shoes).toBeDefined();
      expect(s.slots.top || s.slots.dress).toBeDefined();
      expect(s.score.total).toBeGreaterThan(50);
      expect(s.reason).toMatch(/for work[.;]/);
      expect(s.items.every((i) => i.occasions.includes('work'))).toBe(true);
    }
    expect(isDistinct(suggestions[0], suggestions[1])).toBe(true);
    expect(isDistinct(suggestions[0], suggestions[2])).toBe(true);
    expect(isDistinct(suggestions[1], suggestions[2])).toBe(true);
    expect(suggestions[0].score.total).toBeGreaterThanOrEqual(suggestions[2].score.total);
  });

  it('layers outerwear in cold seasons and not in summer', () => {
    const cold = suggestOutfits({ ...input, season: 'winter' }).suggestions;
    expect(cold.every((s) => s.slots.outerwear)).toBe(true);
    expect(cold.every((s) => s.template.endsWith('_layered'))).toBe(true);
    const summer = suggestOutfits({ ...input, season: 'summer' }).suggestions;
    expect(summer.some((s) => !s.slots.outerwear)).toBe(true);
  });

  it('respects the occasion and dress code', () => {
    const gym = suggestOutfits({ ...input, occasion: 'sport', profile: profile({ dressCode: 'casual' }) }).suggestions;
    expect(gym.length).toBeGreaterThan(0);
    expect(gym.every((s) => s.items.every((i) => i.occasions.includes('sport')))).toBe(true);
    const formal = suggestOutfits({ ...input, profile: profile({ dressCode: 'formal' }) }).suggestions;
    expect(formal.every((s) => s.items.every((i) => i.formality >= 3))).toBe(true);
  });

  it('avoids items worn yesterday when alternatives exist', () => {
    const first = suggestOutfits(input).suggestions[0];
    const history = emptyHistory();
    for (const i of first.items) history.wornYesterday.add(i.id);
    history.recentOutfitKeys.add(outfitKey(first.items));
    const next = suggestOutfits({ ...input, history }).suggestions;
    expect(next.map((s) => outfitKey(s.items))).not.toContain(outfitKey(first.items));
    const repeats = next[0].items.filter((i) => history.wornYesterday.has(i.id));
    expect(repeats.length).toBeLessThanOrEqual(1);
  });

  it('a refresh excludes the previous batch and a new seed changes the order', () => {
    const first = suggestOutfits(input).suggestions;
    const excludeKeys = new Set(first.map((s) => outfitKey(s.items)));
    const second = suggestOutfits({ ...input, excludeKeys, seed: 42 }).suggestions;
    expect(second).toHaveLength(3);
    for (const s of second) expect(excludeKeys.has(outfitKey(s.items))).toBe(false);
  });

  it('is deterministic for the same input and seed', () => {
    const a = suggestOutfits({ ...input, seed: 7 }).suggestions.map((s) => outfitKey(s.items));
    const b = suggestOutfits({ ...input, seed: 7 }).suggestions.map((s) => outfitKey(s.items));
    expect(a).toEqual(b);
  });

  it('works with a tiny closet (fewer than 3 possible) and with an empty one', () => {
    const tiny = suggestOutfits({ ...input, items: pick('white-oxford-shirt', 'navy-chinos', 'brown-loafers') });
    expect(tiny.suggestions).toHaveLength(1);
    expect(suggestOutfits({ ...input, items: [] }).suggestions).toEqual([]);
    expect(suggestOutfits({ ...input, items: pick('white-oxford-shirt', 'navy-chinos') }).suggestions).toEqual([]);
  });

  it('builds a dress outfit for womenswear closets', () => {
    const items = pick('black-midi-dress', 'black-heels', 'navy-blazer', 'black-tote');
    const r = suggestOutfits({ ...input, items, season: 'spring' }).suggestions;
    expect(r).toHaveLength(1);
    expect(r[0].slots.dress?.id).toBe('black-midi-dress');
    expect(r[0].template).toMatch(/^dress/);
  });

  it('scoreCandidate combines the three parts into an integer total', () => {
    const s = scoreCandidate(cand(pick('white-oxford-shirt', 'navy-chinos', 'brown-loafers')), input);
    expect(Number.isInteger(s.total)).toBe(true);
    expect(s.total).toBe(Math.round(0.4 * s.harmony + 0.3 * s.profile + 0.3 * s.history));
  });
});

describe('TemplateReasonProvider', () => {
  const provider = new TemplateReasonProvider();
  const score = { harmony: 80, profile: 70, history: 80, total: 77 };

  it('names the color pairing and the occasion', () => {
    const c = cand(pick('navy-knit', 'beige-chinos', 'brown-loafers'));
    expect(provider.reason(c, { occasion: 'work', score })).toBe('Navy + beige reads sharp for work.');
  });

  it('mentions the outerwear and handles monochrome', () => {
    const layered = withSlot(cand(pick('black-turtleneck', 'black-tailored-trousers', 'black-ankle-boots')), 'outerwear', byKey('camel-coat'));
    expect(provider.reason(layered, { occasion: 'date', score })).toBe('Black + camel reads put-together for a date; the camel coat ties it together.');
    const mono = cand(pick('black-turtleneck', 'black-tailored-trousers', 'black-ankle-boots'));
    expect(provider.reason(mono, { occasion: 'event', score })).toBe('Black head to toe reads polished for an event.');
  });
});
