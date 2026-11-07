import request from 'supertest';
import { bootTestApp, type TestApp } from './harness';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

describe('Photo items (e2e)', () => {
  let t: TestApp;
  beforeAll(async () => {
    t = await bootTestApp();
  });
  afterAll(() => t.close());
  beforeEach(() => {
    t.fal.upload.mockClear();
    t.fal.run.mockClear();
  });

  // /auth/anonymous is throttled to 5/min, so later tests reuse earlier users.
  const users: Record<string, { token: string; userId: string; auth: Record<string, string> }> = {};
  const signUp = async () => {
    const u = (await request(t.app.getHttpServer()).post('/auth/anonymous').expect(201)).body as { token: string; userId: string };
    return { ...u, auth: { Authorization: `Bearer ${u.token}` } };
  };
  const upload = (auth: Record<string, string>, type = 'image/png') =>
    request(t.app.getHttpServer()).post('/items/photo').set(auth).attach('photo', PNG, { filename: 'shirt.png', contentType: type });

  it('uploads, cuts out, tags and creates a photo item that GET /items returns', async () => {
    const u = await signUp();
    const res = await upload(u.auth).expect(201);
    expect(res.body.tagged).toBe(true);
    expect(res.body.item).toMatchObject({ userId: u.userId, source: 'photo', category: 'top', name: 'Blue shirt', primaryColor: 'blue', imageUrl: 'https://fal.example/cutout.png' });
    expect(res.body.item.sourcePhotoId).toEqual(expect.any(String));
    expect(t.fal.upload).toHaveBeenCalledTimes(1);
    expect(t.fal.run.mock.calls.map((c) => c[0])).toEqual(['fal-ai/birefnet/v2', 'openrouter/router/vision']);
    expect(t.fal.run.mock.calls[0][1]).toMatchObject({ image_url: 'https://fal.example/original.jpg' });
    expect(t.fal.run.mock.calls[1][1]).toMatchObject({ image_urls: ['https://fal.example/original.jpg'] });

    const list = await request(t.app.getHttpServer()).get('/items').set(u.auth).expect(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0]).toEqual(res.body.item);

    // owner edits category/subcategory/name/colour/pattern; a stranger gets 404
    const patched = await request(t.app.getHttpServer())
      .patch(`/items/${res.body.item.id}`)
      .set(u.auth)
      .send({ category: 'outerwear', subcategory: 'jacket', name: 'Denim jacket', primaryColor: 'navy', pattern: 'texture' })
      .expect(200);
    expect(patched.body).toMatchObject({ category: 'outerwear', subcategory: 'jacket', name: 'Denim jacket', primaryColor: 'navy', pattern: 'texture' });
    await request(t.app.getHttpServer()).patch(`/items/${res.body.item.id}`).set(u.auth).send({ category: 'hat' }).expect(400);
    const other = await signUp();
    await request(t.app.getHttpServer()).patch(`/items/${res.body.item.id}`).set(other.auth).send({ name: 'Mine now' }).expect(404);
  });

  it('tagging failure → defaults with tagged:false', async () => {
    const u = (users.tagFail = await signUp());
    t.fal.run.mockImplementationOnce(async () => ({ image: { url: 'https://fal.example/cutout.png' } })).mockImplementationOnce(async () => ({ output: 'I cannot see a garment' }));
    const res = await upload(u.auth).expect(201);
    expect(res.body.tagged).toBe(false);
    expect(res.body.item).toMatchObject({ source: 'photo', category: 'top', name: 'My item', formality: 3, warmth: 3, imageUrl: 'https://fal.example/cutout.png' });
  });

  it('cutout failure → 502 PHOTO_PROCESSING_FAILED and no item', async () => {
    const u = (users.cutoutFail = await signUp());
    t.fal.run.mockImplementationOnce(async () => {
      throw new Error('fal down');
    });
    const res = await upload(u.auth).expect(502);
    expect(res.body).toMatchObject({ statusCode: 502, code: 'PHOTO_PROCESSING_FAILED' });
    expect(JSON.stringify(res.body)).not.toMatch(/fal\.example/);
    expect((await request(t.app.getHttpServer()).get('/items').set(u.auth).expect(200)).body).toHaveLength(0);
  });

  it('wrong mime / missing file → 400 INVALID_PHOTO; no fal call', async () => {
    const u = users.cutoutFail;
    expect((await upload(u.auth, 'text/plain').expect(400)).body).toMatchObject({ code: 'INVALID_PHOTO' });
    expect((await request(t.app.getHttpServer()).post('/items/photo').set(u.auth).expect(400)).body).toMatchObject({ code: 'INVALID_PHOTO' });
    expect(t.fal.upload).not.toHaveBeenCalled();
  });

  it('free closet at the limit → 402 ITEM_LIMIT before any upload', async () => {
    const u = users.tagFail; // already holds 1 photo item; FREE_ITEM_LIMIT is 12 in e2e
    const keys = ['white-oxford-shirt', 'light-blue-shirt', 'navy-knit', 'black-tee', 'navy-chinos', 'grey-wool-trousers', 'beige-chinos', 'blue-jeans', 'brown-loafers', 'white-sneakers', 'navy-blazer'];
    await request(t.app.getHttpServer()).post('/items/starter').set(u.auth).send({ starterKeys: keys }).expect(201);
    expect((await upload(u.auth).expect(402)).body).toMatchObject({ code: 'ITEM_LIMIT' });
    expect(t.fal.upload).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated uploads', async () => {
    await request(t.app.getHttpServer()).post('/items/photo').attach('photo', PNG, 'x.png').expect(401);
  });
});
