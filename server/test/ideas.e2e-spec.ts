import request from 'supertest';
import { bootTestApp, type TestApp } from './harness';

type Idea = { key: string; template: string; reason: string; score: number; items: { slot: string; item: { id: string; name: string } }[] };
type Locked = { key: string; template: string; slots: { slot: string; category: string; subcategory: string }[] };

const KEYS = ['white-oxford-shirt', 'light-blue-shirt', 'navy-knit', 'black-tee', 'navy-chinos', 'grey-wool-trousers', 'beige-chinos', 'blue-jeans', 'brown-loafers', 'white-sneakers', 'navy-blazer', 'camel-coat'];

describe('Outfit ideas (e2e)', () => {
  let t: TestApp;
  beforeAll(async () => {
    t = await bootTestApp();
  });
  afterAll(() => t.close());

  const signUp = async (pro = false) => {
    const u = (await request(t.app.getHttpServer()).post('/auth/anonymous').expect(201)).body as { token: string; userId: string };
    if (pro) t.proUserIds.add(u.userId);
    await request(t.app.getHttpServer()).post('/items/starter').set({ Authorization: `Bearer ${u.token}` }).send({ starterKeys: KEYS }).expect(201);
    return { ...u, auth: { Authorization: `Bearer ${u.token}` } };
  };

  it('free: 3 ideas in full + locked silhouettes without ids; save-many persists only the picked ones', async () => {
    const server = t.app.getHttpServer();
    const u = await signUp();

    await request(server).post('/outfits/ideas').set(u.auth).send({ occasion: 'work', vibe: 'loud', formality: 4 }).expect(400);
    const res = await request(server).post('/outfits/ideas').set(u.auth).send({ occasion: 'work', vibe: 'sharp', formality: 4, date: '2026-11-07' }).expect(201);
    expect(res.body).toMatchObject({ occasion: 'work', vibe: 'sharp', formality: 4, isPro: false, freeVisible: 3, proMax: 12, closetTooSmall: false });
    const ideas = res.body.ideas as Idea[];
    const locked = res.body.locked as Locked[];
    expect(ideas).toHaveLength(3);
    expect(res.body.lockedCount).toBeGreaterThan(0);
    expect(locked).toHaveLength(res.body.lockedCount);
    expect(new Set(ideas.map((i) => i.key)).size).toBe(3);
    expect(ideas[0].reason).toMatch(/work/);
    expect(ideas[0].items.map((i) => i.slot)).toEqual(expect.arrayContaining(['top', 'bottom', 'shoes']));
    for (const l of locked) {
      expect(JSON.stringify(l)).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-/); // no uuids leak
      expect(l.slots[0]).toEqual({ slot: expect.any(String), category: expect.any(String), subcategory: expect.any(String) });
    }
    // Nothing persisted by generating
    expect((await request(server).get('/outfits/saved').set(u.auth).expect(200)).body).toHaveLength(0);

    // Save two liked ideas at once
    const pick = ideas.slice(0, 2).map((i) => ({ template: i.template, itemIds: i.items.map((x) => x.item.id) }));
    const saved = await request(server).post('/outfits/save-many').set(u.auth).send({ occasion: 'work', date: '2026-11-07', ideas: pick }).expect(201);
    expect(saved.body).toHaveLength(2);
    expect(saved.body[0]).toMatchObject({ status: 'saved', occasion: 'work', template: pick[0].template, userId: u.userId });
    expect(saved.body[0].items.map((i: { item: { id: string } }) => i.item.id).sort()).toEqual([...pick[0].itemIds].sort());
    expect((await request(server).get('/outfits/saved').set(u.auth).expect(200)).body).toHaveLength(2);
    const one = await request(server).get(`/outfits/${saved.body[0].id}`).set(u.auth).expect(200);
    expect(one.body.items).toHaveLength(pick[0].itemIds.length);

    // Someone else's items → 404; a bad outfit → 400
    const other = await signUp();
    await request(server).post('/outfits/save-many').set(other.auth).send({ ideas: pick }).expect(404);
    await request(server).get(`/outfits/${saved.body[0].id}`).set(other.auth).expect(404);
    const noBottom = ideas[0].items.filter((i) => i.slot === 'shoes' || i.slot === 'top').map((i) => i.item.id);
    const bad = await request(server).post('/outfits/save-many').set(u.auth).send({ ideas: [{ template: 'separates', itemIds: noBottom }] }).expect(400);
    expect(bad.body).toMatchObject({ code: 'INVALID_IDEA' });
  });

  it('pro: up to 12 ideas, nothing locked', async () => {
    const u = await signUp(true);
    const res = await request(t.app.getHttpServer()).post('/outfits/ideas').set(u.auth).send({ occasion: 'friends', vibe: 'relaxed', formality: 2 }).expect(201);
    expect(res.body.isPro).toBe(true);
    expect(res.body.ideas.length).toBeGreaterThan(3);
    expect(res.body.ideas.length).toBeLessThanOrEqual(12);
    expect(res.body.lockedCount).toBe(0);
    expect(res.body.locked).toEqual([]);
  });
});
