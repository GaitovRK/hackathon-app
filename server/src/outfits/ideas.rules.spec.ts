import { STARTER_CATALOG } from '../starter-catalog/catalog';
import type { EngineItem, EngineProfile, Suggestion } from './engine/types';
import { applyBrief, dressCodeForFormality, ideasBodySchema, saveManySchema, splitIdeas, VIBE_TAGS } from './ideas.rules';

const items: EngineItem[] = STARTER_CATALOG.map((s) => ({
  id: s.starterKey,
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
}));
const byCat = (c: EngineItem['category'], n: number) => items.filter((i) => i.category === c)[n];

/** `n` distinct suggestions built from the starter catalog (top n, bottom n, shoes n). */
const suggestions = (n: number): Suggestion[] =>
  Array.from({ length: n }, (_, k) => {
    const top = byCat('top', k % 4);
    const bottom = byCat('bottom', k % 3);
    const shoes = byCat('shoes', k % 2);
    return {
      template: 'separates',
      slots: { top, bottom, shoes },
      items: [top, bottom, shoes],
      score: { harmony: 70, profile: 60, history: 80, total: 70 - k },
      reason: `Idea ${k + 1}.`,
    };
  });

const profile = (over: Partial<EngineProfile> = {}): EngineProfile => ({ dressCode: 'creative', likedTags: new Set(), dislikedTags: new Set(), ...over });

describe('ideas brief', () => {
  it('validates the quick answers', () => {
    expect(ideasBodySchema.safeParse({ occasion: 'work', vibe: 'sharp', formality: 4 }).success).toBe(true);
    expect(ideasBodySchema.safeParse({ occasion: 'work', vibe: 'loud', formality: 4 }).success).toBe(false);
    expect(ideasBodySchema.safeParse({ occasion: 'work', vibe: 'sharp', formality: 6 }).success).toBe(false);
    expect(ideasBodySchema.safeParse({ occasion: 'gala', vibe: 'sharp', formality: 3 }).success).toBe(false);
  });

  it('maps formality 1-5 to a dress code', () => {
    expect([1, 2, 3, 4, 5].map(dressCodeForFormality)).toEqual(['casual', 'casual', 'smart_casual', 'smart_casual', 'formal']);
  });

  it('adds the vibe tags on top of the onboarding tags and drops conflicting dislikes', () => {
    const p = applyBrief(profile({ likedTags: new Set(['key:navy-blazer']), dislikedTags: new Set(['sub:blazer', 'sub:joggers']) }), { vibe: 'sharp', formality: 5 });
    expect(p.dressCode).toBe('formal');
    expect(p.likedTags.has('key:navy-blazer')).toBe(true);
    for (const t of VIBE_TAGS.sharp.liked) expect(p.likedTags.has(t)).toBe(true);
    expect(p.dislikedTags.has('sub:blazer')).toBe(false); // sharp likes blazers: the old dislike loses
    expect(p.dislikedTags.has('sub:joggers')).toBe(true);
  });

  it('relaxed and bold pull in different directions', () => {
    const relaxed = applyBrief(profile(), { vibe: 'relaxed', formality: 2 });
    const bold = applyBrief(profile(), { vibe: 'bold', formality: 2 });
    expect(relaxed.likedTags.has('sub:sneakers')).toBe(true);
    expect(relaxed.dislikedTags.has('sub:blazer')).toBe(true);
    expect(bold.likedTags.has('color:red')).toBe(true);
    expect(bold.likedTags.has('sub:sneakers')).toBe(false);
  });
});

describe('splitIdeas', () => {
  const itemOf = (id: string) => ({ id, secret: 'full item' });

  it('free: the first FREE_IDEAS_VISIBLE in full, the rest locked without item ids', () => {
    const r = splitIdeas(suggestions(12), { isPro: false, freeVisible: 3, proMax: 12 }, itemOf);
    expect(r.ideas).toHaveLength(3);
    expect(r.lockedCount).toBe(9);
    expect(r.locked).toHaveLength(9);
    expect(r.ideas[0].items[0].item).toEqual({ id: expect.any(String), secret: 'full item' });
    expect(r.ideas[0].key.split('+')).toHaveLength(3);
    for (const l of r.locked) {
      expect(l.key).toMatch(/^locked-\d+$/);
      expect(JSON.stringify(l)).not.toMatch(/"id"|name|Color/);
      expect(l.slots.map((s) => s.slot).sort()).toEqual(['bottom', 'shoes', 'top']);
      expect(l.slots[0]).toEqual({ slot: expect.any(String), category: expect.any(String), subcategory: expect.any(String) });
    }
  });

  it('pro: up to PRO_IDEAS_MAX in full, nothing locked', () => {
    const r = splitIdeas(suggestions(15), { isPro: true, freeVisible: 3, proMax: 12 }, itemOf);
    expect(r.ideas).toHaveLength(12);
    expect(r.locked).toEqual([]);
    expect(r.lockedCount).toBe(0);
  });

  it('small closets: fewer ideas than the free limit means nothing is locked', () => {
    const r = splitIdeas(suggestions(2), { isPro: false, freeVisible: 3, proMax: 12 }, itemOf);
    expect(r.ideas).toHaveLength(2);
    expect(r.lockedCount).toBe(0);
  });
});

describe('saveManySchema', () => {
  const uuid = '11111111-1111-4111-8111-111111111111';
  it('needs 1-12 ideas with 2-6 item uuids each', () => {
    expect(saveManySchema.safeParse({ ideas: [{ template: 'separates', itemIds: [uuid, uuid] }] }).success).toBe(true);
    expect(saveManySchema.safeParse({ ideas: [] }).success).toBe(false);
    expect(saveManySchema.safeParse({ ideas: [{ template: 'separates', itemIds: ['nope', uuid] }] }).success).toBe(false);
    expect(saveManySchema.safeParse({ ideas: [{ template: 'tuxedo', itemIds: [uuid, uuid] }] }).success).toBe(false);
  });
});
