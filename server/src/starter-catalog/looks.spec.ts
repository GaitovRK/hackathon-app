import { readFileSync } from 'fs';
import { join } from 'path';
import { getStarterItem, STARTER_CATALOG } from './catalog';
import { LOOKS } from './looks';

/**
 * The app ships its own copy of the looks (`mobile/src/content/looks.ts`) to render the swipe deck
 * offline. This reads that file as text and fails when the two copies drift.
 */
const MOBILE_LOOKS = join(__dirname, '../../../mobile/src/content/looks.ts');
const src = readFileSync(MOBILE_LOOKS, 'utf8');

/** `alias: g("key", "name", "category", "subcategory", "color"[, "pattern"])` */
const visuals = new Map(
  [...src.matchAll(/^\s+(\w+): g\("([^"]+)", "[^"]+", "(\w+)", "(\w+)", "(\w+)"(?:, "(\w+)")?\)/gm)].map((m) => [
    m[1],
    { starterKey: m[2], category: m[3], subcategory: m[4], primaryColor: m[5], pattern: m[6] ?? 'solid' },
  ]),
);
/** `{ id: "look-x", title: "...", wardrobe: "...", items: [G.a, G.b] }` */
const mobileLooks = [...src.matchAll(/\{ id: "([^"]+)", title: "([^"]+)", wardrobe: "(\w+)", items: \[([^\]]*)\] \}/g)].map((m) => ({
  id: m[1],
  title: m[2],
  wardrobe: m[3],
  starterKeys: m[4].split(',').map((a) => visuals.get(a.trim().replace(/^G\./, ''))?.starterKey ?? `missing:${a.trim()}`),
}));

describe('starter looks', () => {
  it('has 20 unique looks, womenswear-led first', () => {
    expect(LOOKS).toHaveLength(20);
    expect(new Set(LOOKS.map((l) => l.id)).size).toBe(20);
    const women = LOOKS.filter((l) => l.wardrobe === 'womenswear');
    expect(women.length).toBeGreaterThanOrEqual(13);
    expect(LOOKS.slice(0, women.length).every((l) => l.wardrobe === 'womenswear')).toBe(true);
    expect(LOOKS.some((l) => l.wardrobe === 'menswear')).toBe(true);
  });

  it('only uses starter items offered to the look wardrobe', () => {
    for (const look of LOOKS) {
      for (const key of look.starterKeys) {
        const item = getStarterItem(key);
        expect({ look: look.id, key, found: !!item }).toEqual({ look: look.id, key, found: true });
        expect(['both', look.wardrobe]).toContain(item!.wardrobe);
      }
    }
  });

  it('matches the app copy: same ids, order, wardrobes and items', () => {
    expect(mobileLooks).toEqual(LOOKS.map(({ id, title, wardrobe, starterKeys }) => ({ id, title, wardrobe, starterKeys })));
  });

  it('draws every app garment with the catalog tags', () => {
    expect(visuals.size).toBeGreaterThan(0);
    for (const v of visuals.values()) {
      const s = STARTER_CATALOG.find((x) => x.starterKey === v.starterKey);
      expect(s && { starterKey: s.starterKey, category: s.category, subcategory: s.subcategory, primaryColor: s.primaryColor, pattern: s.pattern }).toEqual(v);
    }
  });
});

describe('starter catalog', () => {
  it('has unique keys, valid 1-5 scales and lists womenswear first', () => {
    expect(new Set(STARTER_CATALOG.map((s) => s.starterKey)).size).toBe(STARTER_CATALOG.length);
    for (const s of STARTER_CATALOG) {
      expect(s.formality).toBeGreaterThanOrEqual(1);
      expect(s.formality).toBeLessThanOrEqual(5);
      expect(s.warmth).toBeGreaterThanOrEqual(1);
      expect(s.warmth).toBeLessThanOrEqual(5);
      expect(s.seasons.length).toBeGreaterThan(0);
      expect(s.occasions.length).toBeGreaterThan(0);
    }
    const firstOther = STARTER_CATALOG.findIndex((s) => s.wardrobe !== 'womenswear');
    expect(firstOther).toBeGreaterThanOrEqual(15);
    expect(STARTER_CATALOG.slice(firstOther).some((s) => s.wardrobe === 'womenswear')).toBe(false);
  });
});
