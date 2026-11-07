import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ENV, type Env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { EntitlementService } from './entitlement.service';

export const PAYMENT_REQUIRED = 402;

/** 402 codes the app maps to the paywall. */
export type PaywallCode = 'QUOTA_EXCEEDED' | 'ITEM_LIMIT' | 'REFRESH_LIMIT';

export interface QuotaState {
  isPro: boolean;
  limit: number;
  used: number;
  left: number;
}

/** Closet size state: `limit` is null for Pro (unlimited). */
export interface ItemLimitState {
  isPro: boolean;
  limit: number | null;
  count: number;
}

export function startOfUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function paymentRequired(code: PaywallCode, message: string, extra: Record<string, unknown> = {}): HttpException {
  return new HttpException({ statusCode: PAYMENT_REQUIRED, code, message, ...extra }, PAYMENT_REQUIRED);
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
      throw paymentRequired('QUOTA_EXCEEDED', 'Daily generation limit reached', {
        isPro: state.isPro,
        limit: state.limit,
      });
    }
    return state;
  }

  async getItemLimitState(userId: string): Promise<ItemLimitState> {
    const [isPro, count] = await Promise.all([
      this.entitlements.isPro(userId),
      this.prisma.item.count({ where: { userId, archivedAt: null } }),
    ]);
    return { isPro, limit: isPro ? null : this.env.FREE_ITEM_LIMIT, count };
  }

  /** Throws 402 ITEM_LIMIT when adding `adding` items would exceed the free closet size. Pro: unlimited. */
  async assertCanAddItems(userId: string, adding: number): Promise<ItemLimitState> {
    const state = await this.getItemLimitState(userId);
    if (state.limit !== null && state.count + adding > state.limit) {
      throw paymentRequired('ITEM_LIMIT', `Free closets hold up to ${state.limit} items`, {
        isPro: state.isPro,
        limit: state.limit,
        count: state.count,
      });
    }
    return state;
  }

  async getRefreshState(userId: string, date: Date): Promise<QuotaState> {
    const [isPro, used] = await Promise.all([
      this.entitlements.isPro(userId),
      this.prisma.outfitRefresh.count({ where: { userId, date } }),
    ]);
    const limit = isPro ? Number.MAX_SAFE_INTEGER : this.env.FREE_REFRESH_LIMIT;
    return { isPro, limit, used, left: Math.max(0, limit - used) };
  }

  /** Throws 402 REFRESH_LIMIT when a free user has already regenerated today's outfits. Pro: unlimited. */
  async assertCanRefresh(userId: string, date: Date): Promise<QuotaState> {
    const state = await this.getRefreshState(userId, date);
    if (state.left <= 0) {
      throw paymentRequired('REFRESH_LIMIT', 'Daily outfit refresh limit reached', {
        isPro: state.isPro,
        limit: state.limit,
      });
    }
    return state;
  }
}
