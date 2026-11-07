import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { UserId } from '../auth/user-id.decorator';
import { StyleProfileService, type ProfileWithSwipes } from './style-profile.service';

@Controller('style-profile')
export class StyleProfileController {
  constructor(private readonly profiles: StyleProfileService) {}

  @Get()
  get(@UserId() userId: string): Promise<ProfileWithSwipes> {
    return this.profiles.get(userId);
  }

  @Put()
  update(@UserId() userId: string, @Body() body: unknown): Promise<ProfileWithSwipes> {
    return this.profiles.update(userId, body);
  }

  @Post('swipes')
  swipes(@UserId() userId: string, @Body() body: unknown): Promise<ProfileWithSwipes> {
    return this.profiles.addSwipes(userId, body);
  }
}
