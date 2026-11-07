import { Inject, Injectable, Logger } from '@nestjs/common';
import { ENV, type Env } from '../config/env';

const CACHE_TTL_MS = 60_000;
/** A slow RevenueCat must not stall every quota check. */
const FETCH_TIMEOUT_MS = 5_000;

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
    // A failed lookup counts as free for this request only, so a paying user isn't locked out for a minute.
    if (isPro !== null) this.cache.set(userId, { isPro, expiresAt: now + CACHE_TTL_MS });
    return isPro ?? false;
  }

  /** Drops the cached answer, so the next check asks RevenueCat (right after a purchase or restore in the app). */
  forget(userId: string): void {
    this.cache.delete(userId);
  }

  /** null = RevenueCat unavailable (non-2xx, network error or timeout). */
  private async fetchIsPro(userId: string, now: number): Promise<boolean | null> {
    try {
      const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: { Authorization: `Bearer ${this.env.REVENUECAT_SECRET_KEY}` },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        this.logger.warn(`RevenueCat responded ${res.status}`);
        return null;
      }
      const body = (await res.json()) as RcSubscriberResponse;
      const pro = body.subscriber?.entitlements?.pro;
      if (!pro) return false;
      return pro.expires_date === null || new Date(pro.expires_date).getTime() > now;
    } catch (e) {
      this.logger.warn(`RevenueCat fetch failed (${(e as Error).name})`);
      return null;
    }
  }
}
