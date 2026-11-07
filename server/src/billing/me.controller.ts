import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { UserId } from '../auth/user-id.decorator';
import { EntitlementService } from './entitlement.service';
import { QuotaService } from './quota.service';

export interface MeResponse {
  userId: string;
  isPro: boolean;
  freeLeftToday: number;
  itemCount: number;
  /** null = unlimited (Pro) */
  itemLimit: number | null;
}

@Controller('me')
export class MeController {
  constructor(
    private readonly quota: QuotaService,
    private readonly entitlements: EntitlementService,
  ) {}

  @Get()
  async me(@UserId() userId: string): Promise<MeResponse> {
    const [state, items] = await Promise.all([this.quota.getState(userId), this.quota.getItemLimitState(userId)]);
    return { userId, isPro: state.isPro, freeLeftToday: state.left, itemCount: items.count, itemLimit: items.limit };
  }

  /** The app calls this right after a purchase / restore: re-reads the entitlement from RevenueCat instead of the 60 s cache. */
  @Post('sync')
  @HttpCode(200)
  async sync(@UserId() userId: string): Promise<MeResponse> {
    this.entitlements.forget(userId);
    return this.me(userId);
  }
}
