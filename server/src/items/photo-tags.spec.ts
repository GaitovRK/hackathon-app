import { buildFlatLayPrompt, DEFAULT_PHOTO_GARMENT, DEFAULT_PHOTO_TAGS, extractJsonObject, parsePhotoGarments } from './photo-tags';

const shirt = {
  category: 'top',
  subcategory: 'shirt',
  name: 'White oxford shirt',
  description: 'white cotton oxford button-down shirt',
  primaryColor: 'white',
  pattern: 'solid',
  formality: 4,
  warmth: 2,
  seasons: ['spring', 'summer'],
  occasions: ['work', 'date'],
};
const jeans = { ...shirt, category: 'bottom', subcategory: 'jeans', name: 'Blue jeans', description: 'mid-wash straight-leg blue jeans', primaryColor: 'blue', formality: 2 };

describe('parsePhotoGarments', () => {
  it('accepts a valid JSON string with one garment and fills secondaryColor', () => {
    expect(parsePhotoGarments(JSON.stringify({ garments: [shirt] }))).toEqual({ tagged: true, garments: [{ ...shirt, secondaryColor: null }] });
  });

  it('keeps every garment (multi-garment photo) in order', () => {
    const r = parsePhotoGarments({ garments: [shirt, jeans] });
    expect(r.tagged).toBe(true);
    expect(r.garments.map((g) => g.name)).toEqual(['White oxford shirt', 'Blue jeans']);
  });

  it('caps at 4 garments', () => {
    const r = parsePhotoGarments({ garments: [shirt, jeans, shirt, jeans, shirt, jeans] });
    expect(r.garments).toHaveLength(4);
  });

  it('empty garments = no clothing (tagged, nothing to add)', () => {
    expect(parsePhotoGarments('{"garments": []}')).toEqual({ tagged: true, garments: [] });
  });

  it('tolerates markdown fences and prose around the JSON', () => {
    const text = 'Sure! Here you go:\n```json\n' + JSON.stringify({ garments: [shirt] }) + '\n```\nHope this helps.';
    expect(parsePhotoGarments(text)).toMatchObject({ tagged: true, garments: [{ name: 'White oxford shirt' }] });
  });

  it('falls back to all seasons / casual when the model returns empty arrays', () => {
    const r = parsePhotoGarments({ garments: [{ ...shirt, seasons: [], occasions: [] }] });
    expect(r.tagged).toBe(true);
    expect(r.garments[0].seasons).toEqual(['spring', 'summer', 'autumn', 'winter']);
    expect(r.garments[0].occasions).toEqual(['casual']);
  });

  it.each([
    ['invalid enum', { garments: [{ ...shirt, category: 'hat' }] }],
    ['out-of-range formality', { garments: [{ ...shirt, formality: 9 }] }],
    ['unknown colour', { garments: [{ ...shirt, primaryColor: 'teal' }] }],
    ['missing description', { garments: [{ ...shirt, description: undefined }] }],
    ['old single-object shape', shirt],
    ['not JSON', 'no json here'],
    ['null', null],
    ['empty name', { garments: [{ ...shirt, name: '  ' }] }],
  ])('falls back to one default garment with tagged:false on %s', (_label, input) => {
    expect(parsePhotoGarments(input)).toEqual({ tagged: false, garments: [DEFAULT_PHOTO_GARMENT] });
  });

  it('defaults are a sensible top for all seasons', () => {
    expect(DEFAULT_PHOTO_TAGS).toMatchObject({ category: 'top', name: 'My item', formality: 3, warmth: 3, seasons: ['spring', 'summer', 'autumn', 'winter'] });
    expect(DEFAULT_PHOTO_GARMENT).toMatchObject({ ...DEFAULT_PHOTO_TAGS, description: 'garment' });
  });
});

describe('buildFlatLayPrompt', () => {
  it('puts the garment description into the fixed flat-lay style prompt', () => {
    const p = buildFlatLayPrompt('cream cable-knit cropped cardigan with gold buttons');
    expect(p).toMatch(/^Product flat-lay photo of only the cream cable-knit cropped cardigan with gold buttons from the reference image/);
    expect(p).toMatch(/plain pure white background/);
    expect(p).toMatch(/no person, no body, no hanger, no mannequin, no other clothing, no text/);
  });

  it('collapses whitespace, truncates long descriptions and falls back to "garment"', () => {
    expect(buildFlatLayPrompt('  navy   wool\n coat ')).toContain('only the navy wool coat from');
    expect(buildFlatLayPrompt('x'.repeat(500))).toContain(`only the ${'x'.repeat(200)} from`);
    expect(buildFlatLayPrompt('   ')).toContain('only the garment from');
  });
});

describe('extractJsonObject', () => {
  it('throws when there is no object', () => {
    expect(() => extractJsonObject('[]')).toThrow();
  });
});
