import { Inject, Injectable, Logger } from '@nestjs/common';
import { ENV, type Env } from '../config/env';

const CACHE_TTL_MS = 60_000;

interface RcEntitlement {
  expires_date: string | null;
}
interface RcSubscriberResponse {
  subscriber?: { entitlements?: Record<string, RcEntitlement | undefined> };
}

@Injectable()
export class EntitlementService {
  private readonly logger = new Logger(EntitlementService.name);
  private readonly cache = new Map<string, { isPro: boolean; expiresAt: number }>();

  constructor(@Inject(ENV) private readonly env: Env) {}

  async isPro(userId: string, now: number = Date.now()): Promise<boolean> {
    const hit = this.cache.get(userId);
    if (hit && hit.expiresAt > now) return hit.isPro;

    const isPro = await this.fetchIsPro(userId, now);
    this.cache.set(userId, { isPro, expiresAt: now + CACHE_TTL_MS });
    return isPro;
  }

  private async fetchIsPro(userId: string, now: number): Promise<boolean> {
    try {
      const res = await fetch(
        `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
        { headers: { Authorization: `Bearer ${this.env.REVENUECAT_SECRET_KEY}` } },
      );
      if (!res.ok) {
        this.logger.warn(`RevenueCat responded ${res.status}`);
        return false;
      }
      const body = (await res.json()) as RcSubscriberResponse;
      const pro = body.subscriber?.entitlements?.pro;
      if (!pro) return false;
      return pro.expires_date === null || new Date(pro.expires_date).getTime() > now;
    } catch (e) {
      this.logger.warn(`RevenueCat fetch failed (${(e as Error).name})`);
      return false;
    }
  }
}
