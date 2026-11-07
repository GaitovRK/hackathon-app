import { parseModelInput } from './models';

describe('parseModelInput', () => {
  it('accepts a valid flux-schnell input and resolves the endpoint', () => {
    expect(parseModelInput('flux-schnell', { prompt: 'a cat', image_size: 'square' })).toEqual({
      ok: true,
      modelId: 'flux-schnell',
      endpoint: 'fal-ai/flux/schnell',
      input: { prompt: 'a cat', image_size: 'square' },
    });
  });

  it.each([['nope'], [undefined], [42], ['__proto__'], ['toString']])('rejects unknown model %p', (m) => {
    expect(parseModelInput(m, { prompt: 'x' })).toMatchObject({ ok: false, code: 'UNKNOWN_MODEL' });
  });

  it.each([
    [{}],
    [{ prompt: '' }],
    [{ prompt: 'x'.repeat(501) }],
    [{ prompt: 'ok', image_size: 'huge' }],
    [{ prompt: 'ok', num_images: 10 }],
    [null],
  ])('rejects invalid input %p', (input) => {
    expect(parseModelInput('flux-schnell', input)).toMatchObject({ ok: false, code: 'INVALID_INPUT' });
  });
});
