import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { join } from 'node:path';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Shared e2e boot: `.env` → `TEST_DATABASE_URL`, fixed limits, fake keys, migrations, fal + RevenueCat mocked.
 * `proUserIds` makes RevenueCat answer "pro" for those users (everyone else is free).
 */
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
process.env.FREE_IDEAS_VISIBLE = '3';
process.env.PRO_IDEAS_MAX = '12';
process.env.JWT_SECRET = 'e2e-secret-e2e-secret-e2e-secret-1234';
process.env.FAL_KEY = 'fake';
process.env.REVENUECAT_SECRET_KEY = 'fake';

/* eslint-disable @typescript-eslint/no-require-imports */
const { AppModule } = require('../src/app.module') as typeof import('../src/app.module');
const { configureApp } = require('../src/main') as typeof import('../src/main');
const { FalService } = require('../src/fal/fal.service') as typeof import('../src/fal/fal.service');
const { PrismaService } = require('../src/prisma/prisma.service') as typeof import('../src/prisma/prisma.service');
/* eslint-enable @typescript-eslint/no-require-imports */

export interface TestApp {
  app: NestExpressApplication;
  proUserIds: Set<string>;
  close: () => Promise<void>;
}

export async function bootTestApp(): Promise<TestApp> {
  execSync('pnpm prisma migrate deploy', { cwd: root, env: { ...process.env, DATABASE_URL: TEST_DB }, stdio: 'ignore' });
  const proUserIds = new Set<string>();
  const realFetch = global.fetch;
  global.fetch = jest.fn(async (input: string | URL | Request) => {
    const url = String(input);
    const userId = decodeURIComponent(url.split('/subscribers/')[1] ?? '');
    if (proUserIds.has(userId)) return { ok: true, status: 200, json: async () => ({ subscriber: { entitlements: { pro: { expires_date: null } } } }) };
    return { ok: false, status: 404, json: async () => ({}) };
  }) as unknown as typeof fetch;

  const mod = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(FalService)
    .useValue({ submit: jest.fn(async () => ({ requestId: `req-${Date.now()}` })), poll: jest.fn(async () => ({ status: 'done' as const, resultUrl: 'https://cdn.example/img.png' })) })
    .compile();
  const app = mod.createNestApplication<NestExpressApplication>({ bodyParser: false });
  configureApp(app);
  await app.init();
  await app.get(PrismaService).user.deleteMany();
  return {
    app,
    proUserIds,
    close: async () => {
      global.fetch = realFetch;
      await app.close();
    },
  };
}
