import { Controller, Get } from '@nestjs/common';
import { UserId } from '../auth/user-id.decorator';
import { QuotaService } from './quota.service';

@Controller('me')
export class MeController {
  constructor(private readonly quota: QuotaService) {}

  @Get()
  async me(@UserId() userId: string): Promise<{ userId: string; isPro: boolean; freeLeftToday: number }> {
    const state = await this.quota.getState(userId);
    return { userId, isPro: state.isPro, freeLeftToday: state.left };
  }
}
