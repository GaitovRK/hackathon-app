import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Generation } from '@prisma/client';
import { UserId } from '../auth/user-id.decorator';
import { GenerationsService } from './generations.service';

@Controller('generations')
export class GenerationsController {
  constructor(private readonly generations: GenerationsService) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post()
  create(@UserId() userId: string, @Body() body: unknown): Promise<Generation> {
    return this.generations.create(userId, body);
  }

  @Get()
  list(@UserId() userId: string): Promise<Generation[]> {
    return this.generations.list(userId);
  }

  @Get(':id')
  get(@UserId() userId: string, @Param('id', new ParseUUIDPipe()) id: string): Promise<Generation> {
    return this.generations.get(userId, id);
  }
}
