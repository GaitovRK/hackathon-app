import { extractImageUrl, isFinal, mapFalStatus } from './status';

describe('mapFalStatus', () => {
  it.each([
    ['IN_QUEUE', 'queued'],
    ['IN_PROGRESS', 'running'],
    ['COMPLETED', 'done'],
    ['ERROR', 'failed'],
    [undefined, 'failed'],
  ])('%p -> %p', (input, expected) => {
    expect(mapFalStatus(input)).toBe(expected);
  });
});

describe('extractImageUrl', () => {
  it('returns images[0].url', () => {
    expect(extractImageUrl({ images: [{ url: 'https://x/a.png' }, { url: 'https://x/b.png' }] })).toBe(
      'https://x/a.png',
    );
  });
  it('returns null when missing', () => {
    expect(extractImageUrl({ images: [] })).toBeNull();
    expect(extractImageUrl(null)).toBeNull();
    expect(extractImageUrl({ images: [{ url: 1 }] })).toBeNull();
  });
});

describe('isFinal', () => {
  it('done/failed are final, queued/running are not', () => {
    expect([isFinal('done'), isFinal('failed'), isFinal('queued'), isFinal('running')]).toEqual([
      true,
      true,
      false,
      false,
    ]);
  });
});
