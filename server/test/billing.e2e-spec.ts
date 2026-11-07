import request from 'supertest';
import { bootTestApp, type TestApp } from './harness';

describe('Billing (e2e): /me/sync after a purchase', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await bootTestApp();
  });

  afterAll(async () => {
    await t?.close();
  });

  it('POST /me/sync sees a fresh purchase that GET /me still has cached as free', async () => {
    const server = t.app.getHttpServer();
    await request(server).post('/me/sync').expect(401);

    const { body: session } = await request(server).post('/auth/anonymous').expect(201);
    const auth = { Authorization: `Bearer ${session.token}` };

    expect((await request(server).get('/me').set(auth).expect(200)).body).toMatchObject({ isPro: false, itemLimit: 12 });

    t.proUserIds.add(session.userId); // the user buys Pro in the RevenueCat paywall
    expect((await request(server).get('/me').set(auth).expect(200)).body).toMatchObject({ isPro: false }); // 60 s cache

    const synced = await request(server).post('/me/sync').set(auth).expect(200);
    expect(synced.body).toMatchObject({ userId: session.userId, isPro: true, itemLimit: null });
    expect((await request(server).get('/me').set(auth).expect(200)).body).toMatchObject({ isPro: true });
  });
});
