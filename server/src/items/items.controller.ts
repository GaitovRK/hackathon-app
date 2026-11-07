import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import type { Item } from '@prisma/client';
import { UserId } from '../auth/user-id.decorator';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Get()
  list(@UserId() userId: string): Promise<Item[]> {
    return this.items.list(userId);
  }

  /** Bulk add from the starter catalog: `{ starterKeys: string[] }`. Returns the whole closet. */
  @Post('starter')
  addFromStarter(@UserId() userId: string, @Body() body: unknown): Promise<Item[]> {
    return this.items.addFromStarter(userId, body);
  }

  @Patch(':id')
  patch(@UserId() userId: string, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: unknown): Promise<Item> {
    return this.items.patch(userId, id, body);
  }

  @Delete(':id')
  archive(@UserId() userId: string, @Param('id', new ParseUUIDPipe()) id: string): Promise<Item> {
    return this.items.archive(userId, id);
  }
}
