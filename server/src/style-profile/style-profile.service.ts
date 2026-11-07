import { BadRequestException, Injectable } from '@nestjs/common';
import type { StyleProfile, StyleSwipe } from '@prisma/client';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';

export const updateProfileSchema = z.object({
  dressCode: z.enum(['formal', 'smart_casual', 'casual', 'creative']).optional(),
  city: z.string().trim().max(80).nullable().optional(),
  wardrobe: z.enum(['menswear', 'womenswear', 'both']).optional(),
  /** `true` marks onboarding as finished (sets `onboardedAt` once). */
  onboarded: z.boolean().optional(),
});

export const swipesSchema = z.object({
  swipes: z.array(z.object({ lookId: z.string().min(1).max(64), liked: z.boolean() })).min(1).max(100),
});

export type ProfileWithSwipes = StyleProfile & { swipes: StyleSwipe[] };

@Injectable()
export class StyleProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /** The user's profile, created with defaults on first read. */
  async get(userId: string): Promise<ProfileWithSwipes> {
    return this.prisma.styleProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { swipes: true },
    });
  }

  async update(userId: string, body: unknown): Promise<ProfileWithSwipes> {
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException({ code: 'INVALID_PROFILE', message: 'Invalid profile' });
    const { onboarded, ...fields } = parsed.data;
    const existing = await this.get(userId);
    const onboardedAt = onboarded && !existing.onboardedAt ? new Date() : undefined;
    return this.prisma.styleProfile.update({
      where: { userId },
      data: { ...fields, ...(onboardedAt ? { onboardedAt } : {}) },
      include: { swipes: true },
    });
  }

  /** Upserts swipes (one per look); re-swiping a look overwrites it. */
  async addSwipes(userId: string, body: unknown): Promise<ProfileWithSwipes> {
    const parsed = swipesSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException({ code: 'INVALID_SWIPES', message: 'Invalid swipes' });
    const profile = await this.get(userId);
    await this.prisma.$transaction(
      parsed.data.swipes.map((s) =>
        this.prisma.styleSwipe.upsert({
          where: { profileId_lookId: { profileId: profile.id, lookId: s.lookId } },
          create: { profileId: profile.id, lookId: s.lookId, liked: s.liked },
          update: { liked: s.liked },
        }),
      ),
    );
    return this.get(userId);
  }
}
