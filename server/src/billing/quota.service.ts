import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ENV, type Env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { EntitlementService } from './entitlement.service';

export const PAYMENT_REQUIRED = 402;

export interface QuotaState {
  isPro: boolean;
  limit: number;
  used: number;
  left: number;
}

export function startOfUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

@Injectable()
export class QuotaService {
  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly prisma: PrismaService,
    private readonly entitlements: EntitlementService,
  ) {}

  async getState(userId: string, now: Date = new Date()): Promise<QuotaState> {
    const [isPro, used] = await Promise.all([
      this.entitlements.isPro(userId),
      this.prisma.generation.count({
        where: { userId, status: { not: 'failed' }, createdAt: { gte: startOfUtcDay(now) } },
      }),
    ]);
    const limit = isPro ? this.env.PRO_DAILY_LIMIT : this.env.FREE_DAILY_LIMIT;
    return { isPro, limit, used, left: Math.max(0, limit - used) };
  }

  /** Throws 402 QUOTA_EXCEEDED when the user has no generations left today. */
  async assertCanGenerate(userId: string, now: Date = new Date()): Promise<QuotaState> {
    const state = await this.getState(userId, now);
    if (state.left <= 0) {
      throw new HttpException(
        {
          statusCode: PAYMENT_REQUIRED,
          code: 'QUOTA_EXCEEDED',
          message: 'Daily generation limit reached',
          isPro: state.isPro,
          limit: state.limit,
        },
        PAYMENT_REQUIRED,
      );
    }
    return state;
  }
}
