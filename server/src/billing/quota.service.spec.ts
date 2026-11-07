import { HttpException } from '@nestjs/common';
import type { Env } from '../config/env';
import type { PrismaService } from '../prisma/prisma.service';
import type { EntitlementService } from './entitlement.service';
import { QuotaService, startOfUtcDay } from './quota.service';

const env = { FREE_DAILY_LIMIT: 3, PRO_DAILY_LIMIT: 50 } as Env;
const NOW = new Date('2026-03-10T15:30:00Z');

function build(isPro: boolean, used: number) {
  const count = jest.fn().mockResolvedValue(used);
  const prisma = { generation: { count } } as unknown as PrismaService;
  const entitlements = { isPro: jest.fn().mockResolvedValue(isPro) } as unknown as EntitlementService;
  return { svc: new QuotaService(env, prisma, entitlements), count };
}

describe('QuotaService', () => {
  it('startOfUtcDay truncates to 00:00 UTC', () => {
    expect(startOfUtcDay(NOW).toISOString()).toBe('2026-03-10T00:00:00.000Z');
  });

  it('counts only non-failed generations since UTC midnight', async () => {
    const { svc, count } = build(false, 1);
    await svc.getState('u1', NOW);
    expect(count).toHaveBeenCalledWith({
      where: { userId: 'u1', status: { not: 'failed' }, createdAt: { gte: new Date('2026-03-10T00:00:00Z') } },
    });
  });

  it('uses the free limit for non-pro users', async () => {
    const { svc } = build(false, 1);
    await expect(svc.getState('u', NOW)).resolves.toEqual({ isPro: false, limit: 3, used: 1, left: 2 });
  });

  it('uses the pro limit for pro users', async () => {
    const { svc } = build(true, 10);
    await expect(svc.getState('u', NOW)).resolves.toEqual({ isPro: true, limit: 50, used: 10, left: 40 });
  });

  it('allows generation under the limit', async () => {
    const { svc } = build(false, 2);
    await expect(svc.assertCanGenerate('u', NOW)).resolves.toMatchObject({ left: 1 });
  });

  it('throws 402 QUOTA_EXCEEDED at the limit', async () => {
    const { svc } = build(false, 3);
    const err = await svc.assertCanGenerate('u', NOW).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(HttpException);
    expect((err as HttpException).getStatus()).toBe(402);
    expect((err as HttpException).getResponse()).toMatchObject({ code: 'QUOTA_EXCEEDED', statusCode: 402 });
  });

  it('never reports negative left', async () => {
    const { svc } = build(false, 9);
    await expect(svc.getState('u', NOW)).resolves.toMatchObject({ left: 0 });
  });
});
