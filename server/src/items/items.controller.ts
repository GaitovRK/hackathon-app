import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Item } from '@prisma/client';
import { UserId } from '../auth/user-id.decorator';
import { ItemsService, PHOTO_MAX_BYTES, type PhotoItemResult, type UploadedPhoto } from './items.service';

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

  /** multipart/form-data, one `photo` file (jpeg/png/heic/webp, ≤ 20 MB) → `{ item, tagged }`. */
  @Post('photo')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: PHOTO_MAX_BYTES, files: 1 } }))
  addFromPhoto(@UserId() userId: string, @UploadedFile() photo?: UploadedPhoto): Promise<PhotoItemResult> {
    return this.items.addFromPhoto(userId, photo);
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
