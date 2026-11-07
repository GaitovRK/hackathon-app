import { suggestOutfits } from '../outfits/engine/engine';
import { emptyHistory } from '../outfits/engine/history';
import type { EngineItem, EngineProfile } from '../outfits/engine/types';
import { getStarterItem, starterItemsFor } from './catalog';
import { getLook } from './looks';

/**
 * The outfit engine on womenswear starter closets (decision #2: women first). Lives next to the catalog so
 * the womenswear basics are proven to build outfits; the engine's own suite stays in `outfits/engine/`.
 */
const item = (key: string): EngineItem => {
  const s = getStarterItem(key);
  if (!s) throw new Error(`missing starter ${key}`);
  return {
    id: key,
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
    starterKey: key,
  };
};
const pick = (...keys: string[]) => keys.map(item);
const profile = (over: Partial<EngineProfile> = {}): EngineProfile => ({ dressCode: 'smart_casual', likedTags: new Set(), dislikedTags: new Set(), ...over });
const base = { profile: profile(), history: emptyHistory(), occasion: 'work' as const, season: 'autumn' as const };
const ids = (items: { id: string }[]) => items.map((i) => i.id).sort();

describe('womenswear closet', () => {
  it('builds a layered dress outfit: dress + shoes + outerwear', () => {
    const items = pick('black-blazer-dress', 'tan-block-heels', 'camel-belted-trench');
    const { suggestions, relaxation } = suggestOutfits({ ...base, items });
    expect(relaxation).toBe('none');
    expect(suggestions).toHaveLength(1);
    const [s] = suggestions;
    expect(s.template).toBe('dress_layered');
    expect(s.slots.dress?.id).toBe('black-blazer-dress');
    expect(s.slots.shoes?.id).toBe('tan-block-heels');
    expect(s.slots.outerwear?.id).toBe('camel-belted-trench');
    expect(s.reason).toMatch(/for work/);
  });

  it('builds separates from skirt + blouse + flats', () => {
    const items = pick('cream-silk-blouse', 'black-midi-skirt', 'black-ballet-flats');
    const { suggestions } = suggestOutfits({ ...base, season: 'spring', items });
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].template).toMatch(/^separates/);
    expect(ids(suggestions[0].items)).toEqual(ids(items));
  });

  it('suggests 3 distinct work outfits from the womenswear starter closet, mixing dresses and separates', () => {
    const closet = starterItemsFor('womenswear').map((s) => item(s.starterKey));
    for (const season of ['spring', 'summer', 'autumn', 'winter'] as const) {
      const { suggestions } = suggestOutfits({ ...base, items: closet, season });
      expect(suggestions).toHaveLength(3);
      for (const s of suggestions) {
        expect(s.slots.shoes).toBeDefined();
        expect(s.slots.dress || (s.slots.top && s.slots.bottom)).toBeDefined();
        expect(s.items.every((i) => i.occasions.includes('work'))).toBe(true);
      }
    }
    const date = suggestOutfits({ ...base, items: closet, occasion: 'date', seed: 3 }).suggestions;
    expect(date).toHaveLength(3);
  });

  it('leans on liked womenswear looks', () => {
    const look = getLook('look-pleats-loafers')!;
    const likedTags = new Set(look.starterKeys.map((k) => `key:${k}`));
    const closet = starterItemsFor('womenswear').map((s) => item(s.starterKey));
    const liked = suggestOutfits({ ...base, items: closet, profile: profile({ likedTags }) }).suggestions;
    expect(liked[0].items.some((i) => likedTags.has(`key:${i.starterKey}`))).toBe(true);
  });
});
