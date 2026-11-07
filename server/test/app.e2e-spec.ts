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
    await prisma.generation.deleteMany();
    await prisma.user.deleteMany();
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
    expect(me.body).toEqual({ userId: a.userId, isPro: false, freeLeftToday: 2 });

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
});
