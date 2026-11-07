import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { join } from 'node:path';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const root = join(__dirname, '..');
if (existsSync(join(root, '.env'))) {
  const fileEnv = parseEnv(readFileSync(join(root, '.env'), 'utf8'));
  for (const [k, v] of Object.entries(fileEnv)) process.env[k] ??= v;
}
const TEST_DB = process.env.TEST_DATABASE_URL;
if (!TEST_DB) throw new Error('TEST_DATABASE_URL is required for e2e tests');
process.env.DATABASE_URL = TEST_DB;
process.env.FREE_DAILY_LIMIT = '2';
process.env.FREE_ITEM_LIMIT = '12';
process.env.FREE_REFRESH_LIMIT = '1';
process.env.JWT_SECRET = 'e2e-secret-e2e-secret-e2e-secret-1234';
process.env.FAL_KEY = 'fake';
process.env.REVENUECAT_SECRET_KEY = 'fake';

/* eslint-disable @typescript-eslint/no-require-imports */
const { AppModule } = require('../src/app.module') as typeof import('../src/app.module');
const { configureApp } = require('../src/main') as typeof import('../src/main');
const { FalService } = require('../src/fal/fal.service') as typeof import('../src/fal/fal.service');
const { PrismaService } = require('../src/prisma/prisma.service') as typeof import('../src/prisma/prisma.service');
/* eslint-enable @typescript-eslint/no-require-imports */

describe('App (e2e)', () => {
  let app: NestExpressApplication;
  let reqCounter = 0;
  const falMock = {
    submit: jest.fn(async () => ({ requestId: `req-${Date.now()}-${++reqCounter}` })),
    poll: jest.fn(async () => ({ status: 'done' as const, resultUrl: 'https://cdn.example/img.png' })),
  };
  const realFetch = global.fetch;

  beforeAll(async () => {
    execSync('pnpm prisma migrate deploy', { cwd: root, env: { ...process.env, DATABASE_URL: TEST_DB }, stdio: 'ignore' });
    // RevenueCat: everyone is non-pro
    global.fetch = jest.fn(async () => ({ ok: false, status: 404, json: async () => ({}) })) as unknown as typeof fetch;

    const mod = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FalService)
      .useValue(falMock)
      .compile();
    app = mod.createNestApplication<NestExpressApplication>({ bodyParser: false });
    configureApp(app);
    await app.init();
    const prisma = app.get(PrismaService);
    await prisma.user.deleteMany(); // cascades to generations, items, outfits, wears, profiles
  });

  afterAll(async () => {
    global.fetch = realFetch;
    await app?.close();
  });

  it('full flow: auth -> me -> generate -> poll -> isolation -> quota', async () => {
    const server = app.getHttpServer();

    await request(server).get('/health').expect(200, { ok: true });
    const unauth = await request(server).get('/me').expect(401);
    expect(unauth.body).toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED' });

    const a = (await request(server).post('/auth/anonymous').expect(201)).body as { token: string; userId: string };
    const b = (await request(server).post('/auth/anonymous').expect(201)).body as { token: string; userId: string };
    const authA = { Authorization: `Bearer ${a.token}` };

    const me = await request(server).get('/me').set(authA).expect(200);
    expect(me.body).toEqual({ userId: a.userId, isPro: false, freeLeftToday: 2, itemCount: 0, itemLimit: 12 });

    const bad = await request(server).post('/generations').set(authA).send({ model: 'nope', input: {} }).expect(400);
    expect(bad.body).toMatchObject({ statusCode: 400, code: 'UNKNOWN_MODEL' });
    await request(server).post('/generations').set(authA).send({ model: 'flux-schnell', input: { prompt: '' } }).expect(400);

    const created = await request(server)
      .post('/generations')
      .set(authA)
      .send({ model: 'flux-schnell', input: { prompt: 'a cat' } })
      .expect(201);
    expect(created.body).toMatchObject({ status: 'queued', model: 'flux-schnell', userId: a.userId });

    const polled = await request(server).get(`/generations/${created.body.id}`).set(authA).expect(200);
    expect(polled.body).toMatchObject({ status: 'done', resultUrl: 'https://cdn.example/img.png' });

    await request(server).get(`/generations/${created.body.id}`).set({ Authorization: `Bearer ${b.token}` }).expect(404);

    const list = await request(server).get('/generations').set(authA).expect(200);
    expect(list.body).toHaveLength(1);

    await request(server).post('/generations').set(authA).send({ model: 'flux-schnell', input: { prompt: 'two' } }).expect(201);
    const over = await request(server)
      .post('/generations')
      .set(authA)
      .send({ model: 'flux-schnell', input: { prompt: 'three' } })
      .expect(402);
    expect(over.body).toMatchObject({ statusCode: 402, code: 'QUOTA_EXCEEDED' });
    expect(falMock.submit).toHaveBeenCalledTimes(2);
  });

  it('closet flow: onboard -> starter items -> today returns 3 outfits -> wear -> tomorrow avoids them -> limits', async () => {
    const server = app.getHttpServer();
    const u = (await request(server).post('/auth/anonymous').expect(201)).body as { token: string; userId: string };
    const auth = { Authorization: `Bearer ${u.token}` };
    const other = (await request(server).post('/auth/anonymous').expect(201)).body as { token: string };

    // Onboarding: swipes + profile
    const swiped = await request(server)
      .post('/style-profile/swipes')
      .set(auth)
      .send({ swipes: [{ lookId: 'look-office-classic', liked: true }, { lookId: 'look-athleisure', liked: false }] })
      .expect(201);
    expect(swiped.body.swipes).toHaveLength(2);
    const profile = await request(server).put('/style-profile').set(auth).send({ dressCode: 'smart_casual', city: 'Istanbul', wardrobe: 'menswear', onboarded: true }).expect(200);
    expect(profile.body).toMatchObject({ dressCode: 'smart_casual', city: 'Istanbul', wardrobe: 'menswear' });
    expect(profile.body.onboardedAt).toBeTruthy();
    await request(server).put('/style-profile').set(auth).send({ dressCode: 'bogus' }).expect(400);

    // Starter catalog + bulk add
    const catalog = await request(server).get('/starter-catalog').set(auth).expect(200);
    expect(catalog.body.items.length).toBeGreaterThanOrEqual(30);
    expect(catalog.body.looks.length).toBeGreaterThanOrEqual(20);
    const keys = ['white-oxford-shirt', 'light-blue-shirt', 'navy-knit', 'navy-chinos', 'grey-wool-trousers', 'beige-chinos', 'brown-loafers', 'white-sneakers', 'navy-blazer', 'camel-coat'];
    const closet = await request(server).post('/items/starter').set(auth).send({ starterKeys: keys }).expect(201);
    expect(closet.body).toHaveLength(10);
    expect(closet.body[0]).toMatchObject({ source: 'starter', userId: u.userId });
    // idempotent re-add
    expect((await request(server).post('/items/starter').set(auth).send({ starterKeys: keys.slice(0, 2) }).expect(201)).body).toHaveLength(10);
    await request(server).post('/items/starter').set(auth).send({ starterKeys: ['nope'] }).expect(400);

    // Today: 3 distinct outfits, persisted (same answer on a second call)
    const today = await request(server).get('/outfits/today?occasion=work&date=2026-11-07').set(auth).expect(200);
    expect(today.body).toMatchObject({ date: '2026-11-07', occasion: 'work', refreshesLeft: 1, closetTooSmall: false });
    expect(today.body.outfits).toHaveLength(3);
    const first = today.body.outfits[0] as { id: string; reason: string; score: number; status: string; items: { slot: string; item: { id: string } }[] };
    expect(first.status).toBe('suggested');
    expect(first.reason).toMatch(/work/);
    expect(first.items.map((i) => i.slot)).toEqual(expect.arrayContaining(['top', 'bottom', 'shoes', 'outerwear']));
    const again = await request(server).get('/outfits/today?occasion=work&date=2026-11-07').set(auth).expect(200);
    expect(again.body.outfits.map((o: { id: string }) => o.id)).toEqual(today.body.outfits.map((o: { id: string }) => o.id));

    // Isolation + actions
    await request(server).post(`/outfits/${first.id}/wear`).set({ Authorization: `Bearer ${other.token}` }).send({}).expect(404);
    const worn = await request(server).post(`/outfits/${first.id}/wear`).set(auth).send({ date: '2026-11-07' }).expect(201);
    expect(worn.body.status).toBe('worn');
    await request(server).post(`/outfits/${today.body.outfits[1].id}/save`).set(auth).expect(201);
    await request(server).post(`/outfits/${first.id}/feedback`).set(auth).send({ value: 'like' }).expect(201);
    await request(server).post(`/outfits/${first.id}/feedback`).set(auth).send({ value: 'meh' }).expect(400);
    const saved = await request(server).get('/outfits/saved').set(auth).expect(200);
    expect(saved.body).toHaveLength(2);

    // Tomorrow: the worn outfit is not repeated, and its items are mostly rotated out
    const wornIds = new Set(first.items.map((i) => i.item.id));
    const tomorrow = await request(server).get('/outfits/today?occasion=work&date=2026-11-08').set(auth).expect(200);
    expect(tomorrow.body.outfits).toHaveLength(3);
    const top = tomorrow.body.outfits[0] as { items: { item: { id: string } }[] };
    expect(top.items.filter((i) => wornIds.has(i.item.id)).length).toBeLessThanOrEqual(1);
    const tomorrowSets = tomorrow.body.outfits.map((o: { items: { item: { id: string } }[] }) => o.items.map((i) => i.item.id).sort().join('+'));
    expect(tomorrowSets).not.toContain([...wornIds].sort().join('+'));

    // Refresh: free gets one, then 402 REFRESH_LIMIT
    const refreshed = await request(server).get('/outfits/today?occasion=work&date=2026-11-08&refresh=1').set(auth).expect(200);
    expect(refreshed.body.refreshesLeft).toBe(0);
    expect(refreshed.body.outfits.map((o: { id: string }) => o.id)).not.toEqual(tomorrow.body.outfits.map((o: { id: string }) => o.id));
    const noRefresh = await request(server).get('/outfits/today?occasion=work&date=2026-11-08&refresh=1').set(auth).expect(402);
    expect(noRefresh.body).toMatchObject({ statusCode: 402, code: 'REFRESH_LIMIT' });

    // Item limit (12 in this test): 10 + 3 more -> 402 ITEM_LIMIT with the existing error shape
    const limit = await request(server).post('/items/starter').set(auth).send({ starterKeys: ['black-tee', 'white-tee', 'blue-jeans'] }).expect(402);
    expect(limit.body).toMatchObject({ statusCode: 402, code: 'ITEM_LIMIT', limit: 12, count: 10 });
    await request(server).post('/items/starter').set(auth).send({ starterKeys: ['black-tee', 'white-tee'] }).expect(201);

    // Patch + archive
    const patched = await request(server).patch(`/items/${first.items[0].item.id}`).set(auth).send({ primaryColor: 'burgundy', formality: 4 }).expect(200);
    expect(patched.body).toMatchObject({ primaryColor: 'burgundy', formality: 4 });
    await request(server).patch(`/items/${first.items[0].item.id}`).set({ Authorization: `Bearer ${other.token}` }).send({ formality: 1 }).expect(404);
    await request(server).delete(`/items/${first.items[0].item.id}`).set(auth).expect(200);
    const list = await request(server).get('/items').set(auth).expect(200);
    expect(list.body).toHaveLength(11);
    expect((await request(server).get('/me').set(auth).expect(200)).body).toMatchObject({ itemCount: 11, itemLimit: 12 });
  });
});
