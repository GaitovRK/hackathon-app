import { DEFAULT_PHOTO_TAGS, extractJsonObject, parsePhotoTags } from './photo-tags';

const good = {
  category: 'top',
  subcategory: 'shirt',
  name: 'White oxford shirt',
  primaryColor: 'white',
  pattern: 'solid',
  formality: 4,
  warmth: 2,
  seasons: ['spring', 'summer'],
  occasions: ['work', 'date'],
};

describe('parsePhotoTags', () => {
  it('accepts a valid JSON string and fills secondaryColor', () => {
    expect(parsePhotoTags(JSON.stringify(good))).toEqual({ tagged: true, tags: { ...good, secondaryColor: null } });
  });

  it('tolerates markdown fences and prose around the JSON', () => {
    const text = 'Sure! Here you go:\n```json\n' + JSON.stringify(good) + '\n```\nHope this helps.';
    expect(parsePhotoTags(text)).toMatchObject({ tagged: true, tags: { name: 'White oxford shirt' } });
  });

  it('falls back to all seasons / casual when the model returns empty arrays', () => {
    const r = parsePhotoTags({ ...good, seasons: [], occasions: [] });
    expect(r.tagged).toBe(true);
    expect(r.tags.seasons).toEqual(['spring', 'summer', 'autumn', 'winter']);
    expect(r.tags.occasions).toEqual(['casual']);
  });

  it.each([
    ['invalid enum', { ...good, category: 'hat' }],
    ['out-of-range formality', { ...good, formality: 9 }],
    ['unknown colour', { ...good, primaryColor: 'teal' }],
    ['not JSON', 'no json here'],
    ['null', null],
    ['empty name', { ...good, name: '  ' }],
  ])('falls back to defaults with tagged:false on %s', (_label, input) => {
    expect(parsePhotoTags(input)).toEqual({ tagged: false, tags: DEFAULT_PHOTO_TAGS });
  });

  it('defaults are a sensible top for all seasons', () => {
    expect(DEFAULT_PHOTO_TAGS).toMatchObject({ category: 'top', name: 'My item', formality: 3, warmth: 3, seasons: ['spring', 'summer', 'autumn', 'winter'] });
  });
});

describe('extractJsonObject', () => {
  it('throws when there is no object', () => {
    expect(() => extractJsonObject('[]')).toThrow();
  });
});
