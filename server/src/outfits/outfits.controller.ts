import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { UserId } from '../auth/user-id.decorator';
import { OutfitsService, type OutfitWithItems, type TodayResponse } from './outfits.service';

@Controller('outfits')
export class OutfitsController {
  constructor(private readonly outfits: OutfitsService) {}

  /** `GET /outfits/today?occasion=work&date=YYYY-MM-DD&refresh=1` */
  @Get('today')
  today(@UserId() userId: string, @Query() query: unknown): Promise<TodayResponse> {
    return this.outfits.today(userId, query);
  }

  @Get('saved')
  saved(@UserId() userId: string): Promise<OutfitWithItems[]> {
    return this.outfits.listSaved(userId);
  }

  @Post(':id/wear')
  wear(@UserId() userId: string, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: unknown): Promise<OutfitWithItems> {
    return this.outfits.wear(userId, id, body);
  }

  @Post(':id/save')
  save(@UserId() userId: string, @Param('id', new ParseUUIDPipe()) id: string): Promise<OutfitWithItems> {
    return this.outfits.save(userId, id);
  }

  @Post(':id/feedback')
  feedback(@UserId() userId: string, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: unknown): Promise<{ ok: true }> {
    return this.outfits.feedback(userId, id, body);
  }
}
