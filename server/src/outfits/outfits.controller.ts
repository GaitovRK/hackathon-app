import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { UserId } from '../auth/user-id.decorator';
import { IdeasService, type IdeasResponse } from './ideas.service';
import { OutfitsService, type OutfitWithItems, type TodayResponse } from './outfits.service';

@Controller('outfits')
export class OutfitsController {
  constructor(
    private readonly outfits: OutfitsService,
    private readonly ideas: IdeasService,
  ) {}

  /** `GET /outfits/today?occasion=work&date=YYYY-MM-DD&refresh=1` */
  @Get('today')
  today(@UserId() userId: string, @Query() query: unknown): Promise<TodayResponse> {
    return this.outfits.today(userId, query);
  }

  @Get('saved')
  saved(@UserId() userId: string): Promise<OutfitWithItems[]> {
    return this.outfits.listSaved(userId);
  }

  /** `POST /outfits/ideas` `{ occasion, vibe, formality, date? }`: ideas from the quick questions, nothing persisted. */
  @Post('ideas')
  generateIdeas(@UserId() userId: string, @Body() body: unknown): Promise<IdeasResponse> {
    return this.ideas.ideas(userId, body);
  }

  /** `POST /outfits/save-many` `{ occasion?, date?, ideas: [{ template, itemIds }] }`: saves the liked ideas. */
  @Post('save-many')
  saveMany(@UserId() userId: string, @Body() body: unknown): Promise<OutfitWithItems[]> {
    return this.ideas.saveMany(userId, body);
  }

  @Get(':id')
  get(@UserId() userId: string, @Param('id', new ParseUUIDPipe()) id: string): Promise<OutfitWithItems> {
    return this.outfits.get(userId, id);
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
