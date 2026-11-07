import request from 'supertest';
import { bootTestApp, type TestApp } from './harness';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

const ORIGINAL = 'https://fal.example/original.jpg';
const VISION = 'openrouter/router/vision';
const EDIT = 'fal-ai/nano-banana/edit';
const CUTOUT = 'fal-ai/birefnet/v2';

const shirt = { category: 'top', subcategory: 'shirt', name: 'Blue shirt', description: 'light blue cotton shirt', primaryColor: 'blue', pattern: 'solid', formality: 3, warmth: 2, seasons: ['spring'], occasions: ['work'] };
const jeans = { ...shirt, category: 'bottom', subcategory: 'jeans', name: 'Blue jeans', description: 'dark indigo straight jeans', primaryColor: 'navy', formality: 2 };

type RunInput = Record<string, unknown>;
/** Realistic fal stand-in: vision lists `garments`, the edit model renders `flatlay-<n>.png`, birefnet returns `cutout(<source>)`. */
function falAnswers(t: TestApp, garments: unknown[], opts: { editFails?: boolean; cutoutFails?: (source: string) => boolean } = {}) {
  let renders = 0;
  t.fal.run.mockImplementation(async (endpoint: string, input: RunInput) => {
    if (endpoint === VISION) return { output: JSON.stringify({ garments }) };
    if (endpoint === EDIT) {
      if (opts.editFails) throw new Error('edit down');
      return { images: [{ url: `https://fal.example/flatlay-${++renders}.png` }], description: 'ok' };
    }
    if (endpoint === CUTOUT) {
      const source = String(input.image_url);
      if (opts.cutoutFails?.(source)) throw new Error('cutout down');
      return { image: { url: `https://fal.example/cutout(${source.split('/').pop()})` } };
    }
    throw new Error(`unexpected endpoint ${endpoint}`);
  });
}

describe('Photo items (e2e)', () => {
  let t: TestApp;
  beforeAll(async () => {
    t = await bootTestApp();
  });
  afterAll(() => t.close());
  beforeEach(() => {
    t.fal.upload.mockClear();
    t.fal.run.mockReset();
    falAnswers(t, [shirt]);
  });

  // /auth/anonymous is throttled to 5/min, so later tests reuse earlier users.
  const users: Record<string, { token: string; userId: string; auth: Record<string, string> }> = {};
  const signUp = async () => {
    const u = (await request(t.app.getHttpServer()).post('/auth/anonymous').expect(201)).body as { token: string; userId: string };
    return { ...u, auth: { Authorization: `Bearer ${u.token}` } };
  };
  const upload = (auth: Record<string, string>, type = 'image/png') =>
    request(t.app.getHttpServer()).post('/items/photo').set(auth).attach('photo', PNG, { filename: 'shirt.png', contentType: type });
  const calls = (endpoint: string) => t.fal.run.mock.calls.filter((c) => c[0] === endpoint).map((c) => c[1] as RunInput);

  it('uploads, tags, renders a flat-lay, cuts it out and creates one photo item that GET /items returns', async () => {
    const u = (users.one = await signUp());
    const res = await upload(u.auth).expect(201);
    expect(res.body.tagged).toBe(true);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({ userId: u.userId, source: 'photo', category: 'top', name: 'Blue shirt', primaryColor: 'blue', imageUrl: 'https://fal.example/cutout(flatlay-1.png)' });
    expect(res.body.items[0].sourcePhotoId).toEqual(expect.any(String));
    expect(t.fal.upload).toHaveBeenCalledTimes(1);
    expect(t.fal.run.mock.calls.map((c) => c[0])).toEqual([VISION, EDIT, CUTOUT]);
    expect(calls(VISION)[0]).toMatchObject({ image_urls: [ORIGINAL] });
    expect(calls(EDIT)[0]).toMatchObject({ image_urls: [ORIGINAL], num_images: 1, output_format: 'png' });
    expect(String(calls(EDIT)[0].prompt)).toMatch(/flat-lay photo of only the light blue cotton shirt from the reference image/);
    expect(calls(CUTOUT)[0]).toMatchObject({ image_url: 'https://fal.example/flatlay-1.png', output_format: 'png' });

    const list = await request(t.app.getHttpServer()).get('/items').set(u.auth).expect(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0]).toEqual(res.body.items[0]);

    // owner edits category/subcategory/name/colour/pattern; a stranger gets 404
    const id = res.body.items[0].id;
    const patched = await request(t.app.getHttpServer())
      .patch(`/items/${id}`)
      .set(u.auth)
      .send({ category: 'outerwear', subcategory: 'jacket', name: 'Denim jacket', primaryColor: 'navy', pattern: 'texture' })
      .expect(200);
    expect(patched.body).toMatchObject({ category: 'outerwear', subcategory: 'jacket', name: 'Denim jacket', primaryColor: 'navy', pattern: 'texture' });
    await request(t.app.getHttpServer()).patch(`/items/${id}`).set(u.auth).send({ category: 'hat' }).expect(400);
    const other = (users.other = await signUp());
    await request(t.app.getHttpServer()).patch(`/items/${id}`).set(other.auth).send({ name: 'Mine now' }).expect(404);
  });

  it('two garments → two items from the same source photo, rendered in parallel', async () => {
    const u = users.other;
    falAnswers(t, [shirt, jeans]);
    const res = await upload(u.auth).expect(201);
    expect(res.body.tagged).toBe(true);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.items.map((i: { name: string }) => i.name)).toEqual(['Blue shirt', 'Blue jeans']);
    expect(res.body.items[0].sourcePhotoId).toBe(res.body.items[1].sourcePhotoId);
    expect(res.body.items.map((i: { imageUrl: string }) => i.imageUrl).sort()).toEqual(['https://fal.example/cutout(flatlay-1.png)', 'https://fal.example/cutout(flatlay-2.png)']);
    expect(calls(VISION)).toHaveLength(1);
    expect(calls(EDIT).map((i) => String(i.prompt))).toEqual([expect.stringContaining('light blue cotton shirt'), expect.stringContaining('dark indigo straight jeans')]);
    expect(calls(CUTOUT)).toHaveLength(2);
    expect((await request(t.app.getHttpServer()).get('/items').set(u.auth).expect(200)).body).toHaveLength(2);
  });

  it('flat-lay generation failure → fallback cutout of the original photo, upload still succeeds', async () => {
    const u = (users.editFail = await signUp());
    falAnswers(t, [shirt], { editFails: true });
    const res = await upload(u.auth).expect(201);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({ name: 'Blue shirt', imageUrl: 'https://fal.example/cutout(original.jpg)' });
    expect(calls(CUTOUT)).toEqual([{ image_url: ORIGINAL, output_format: 'png' }]);
  });

  it('cutout of the flat-lay failing → cutout of the original instead', async () => {
    const u = users.editFail;
    falAnswers(t, [shirt], { cutoutFails: (source) => source.includes('flatlay') });
    const res = await upload(u.auth).expect(201);
    expect(res.body.items[0].imageUrl).toBe('https://fal.example/cutout(original.jpg)');
    expect(calls(CUTOUT).map((i) => i.image_url)).toEqual(['https://fal.example/flatlay-1.png', ORIGINAL]);
  });

  it('no clothing in the photo → 422 NOT_CLOTHING, nothing rendered, no item', async () => {
    const u = users.editFail;
    const before = (await request(t.app.getHttpServer()).get('/items').set(u.auth).expect(200)).body.length;
    falAnswers(t, []);
    const res = await upload(u.auth).expect(422);
    expect(res.body).toMatchObject({ statusCode: 422, code: 'NOT_CLOTHING' });
    expect(calls(EDIT)).toHaveLength(0);
    expect(calls(CUTOUT)).toHaveLength(0);
    expect((await request(t.app.getHttpServer()).get('/items').set(u.auth).expect(200)).body).toHaveLength(before);
  });

  it('tagging failure → one default item with tagged:false, still a flat-lay cutout', async () => {
    const u = (users.tagFail = await signUp());
    t.fal.run.mockImplementation(async (endpoint: string, input: RunInput) => {
      if (endpoint === VISION) return { output: 'I cannot see a garment' };
      if (endpoint === EDIT) return { images: [{ url: 'https://fal.example/flatlay-1.png' }], description: '' };
      return { image: { url: `https://fal.example/cutout(${String(input.image_url).split('/').pop()})` } };
    });
    const res = await upload(u.auth).expect(201);
    expect(res.body.tagged).toBe(false);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({ source: 'photo', category: 'top', name: 'My item', formality: 3, warmth: 3, imageUrl: 'https://fal.example/cutout(flatlay-1.png)' });
    expect(String(calls(EDIT)[0].prompt)).toContain('only the garment from the reference image');
  });

  it('every cutout failing → 502 PHOTO_PROCESSING_FAILED and no item', async () => {
    const u = users.tagFail;
    const before = (await request(t.app.getHttpServer()).get('/items').set(u.auth).expect(200)).body.length;
    falAnswers(t, [shirt], { cutoutFails: () => true });
    const res = await upload(u.auth).expect(502);
    expect(res.body).toMatchObject({ statusCode: 502, code: 'PHOTO_PROCESSING_FAILED' });
    expect(JSON.stringify(res.body)).not.toMatch(/fal\.example/);
    expect((await request(t.app.getHttpServer()).get('/items').set(u.auth).expect(200)).body).toHaveLength(before);
  });

  // POST /items/photo is throttled to 10/min per IP, so this suite stays at 10 uploads (401 is covered by app.e2e).
  it('wrong mime → 400 INVALID_PHOTO; no fal call', async () => {
    const u = users.tagFail;
    expect((await upload(u.auth, 'text/plain').expect(400)).body).toMatchObject({ code: 'INVALID_PHOTO' });
    expect(t.fal.upload).not.toHaveBeenCalled();
  });

  it('two garments with one free slot left → 402 ITEM_LIMIT after tagging, nothing rendered', async () => {
    const u = users.tagFail; // already holds 1 photo item; FREE_ITEM_LIMIT is 12 in e2e
    const keys = ['white-oxford-shirt', 'light-blue-shirt', 'navy-knit', 'black-tee', 'navy-chinos', 'grey-wool-trousers', 'beige-chinos', 'blue-jeans', 'brown-loafers', 'white-sneakers'];
    await request(t.app.getHttpServer()).post('/items/starter').set(u.auth).send({ starterKeys: keys }).expect(201);
    falAnswers(t, [shirt, jeans]);
    expect((await upload(u.auth).expect(402)).body).toMatchObject({ code: 'ITEM_LIMIT' });
    expect(calls(VISION)).toHaveLength(1);
    expect(calls(EDIT)).toHaveLength(0);
    expect((await request(t.app.getHttpServer()).get('/items').set(u.auth).expect(200)).body).toHaveLength(11);
  });

  it('free closet at the limit → 402 ITEM_LIMIT before any upload', async () => {
    const u = users.tagFail;
    await request(t.app.getHttpServer()).post('/items/starter').set(u.auth).send({ starterKeys: ['navy-blazer'] }).expect(201);
    expect((await upload(u.auth).expect(402)).body).toMatchObject({ code: 'ITEM_LIMIT' });
    expect(t.fal.upload).not.toHaveBeenCalled();
  });
});
