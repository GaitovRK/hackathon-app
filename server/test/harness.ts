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

export interface FalMock {
  submit: jest.Mock;
  poll: jest.Mock;
  upload: jest.Mock;
  run: jest.Mock;
}

export interface TestApp {
  app: NestExpressApplication;
  proUserIds: Set<string>;
  /** The FalService stand-in: override `upload` / `run` per test; never calls fal. */
  fal: FalMock;
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
    // Like RevenueCat: an unknown or free user is a 200 with no entitlements.
    return { ok: true, status: 200, json: async () => ({ subscriber: { entitlements: {} } }) };
  }) as unknown as typeof fetch;

  const fal: FalMock = {
    submit: jest.fn(async () => ({ requestId: `req-${Date.now()}` })),
    poll: jest.fn(async () => ({ status: 'done' as const, resultUrl: 'https://cdn.example/img.png' })),
    upload: jest.fn(async () => 'https://fal.example/original.jpg'),
    run: jest.fn(async (endpoint: string) => {
      if (endpoint === 'fal-ai/birefnet/v2') return { image: { url: 'https://fal.example/cutout.png' } };
      if (endpoint === 'fal-ai/nano-banana/edit') return { images: [{ url: 'https://fal.example/flatlay.png' }], description: '' };
      return { output: '{"garments":[{"category":"top","subcategory":"shirt","name":"Blue shirt","description":"light blue cotton shirt","primaryColor":"blue","pattern":"solid","formality":3,"warmth":2,"seasons":["spring"],"occasions":["work"]}]}' };
    }),
  };
  const mod = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(FalService).useValue(fal).compile();
  const app = mod.createNestApplication<NestExpressApplication>({ bodyParser: false });
  configureApp(app);
  await app.init();
  await app.get(PrismaService).user.deleteMany();
  return {
    app,
    proUserIds,
    fal,
    close: async () => {
      global.fetch = realFetch;
      await app.close();
    },
  };
}
