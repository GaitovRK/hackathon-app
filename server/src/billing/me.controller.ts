import { Controller, Get } from '@nestjs/common';
import { UserId } from '../auth/user-id.decorator';
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
  constructor(private readonly quota: QuotaService) {}

  @Get()
  async me(@UserId() userId: string): Promise<MeResponse> {
    const [state, items] = await Promise.all([this.quota.getState(userId), this.quota.getItemLimitState(userId)]);
    return { userId, isPro: state.isPro, freeLeftToday: state.left, itemCount: items.count, itemLimit: items.limit };
  }
}
