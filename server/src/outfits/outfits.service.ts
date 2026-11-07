import { BadRequestException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import type { Item, Occasion, Outfit, OutfitItem, OutfitSlot, Prisma } from '@prisma/client';
import { z } from 'zod';
import { QuotaService } from '../billing/quota.service';
import { PrismaService } from '../prisma/prisma.service';
import { getStarterItem } from '../starter-catalog/catalog';
import { getLook } from '../starter-catalog/looks';
import { StyleProfileService } from '../style-profile/style-profile.service';
import { suggestOutfits } from './engine/engine';
import { seasonOf } from './engine/filters';
import { tagsOfItems } from './engine/profile';
import { TemplateReasonProvider, type ReasonProvider } from './engine/reasons';
import { outfitKey, type EngineItem, type EngineProfile, type WearHistory } from './engine/types';

export const REASON_PROVIDER = Symbol('REASON_PROVIDER');

const OCCASIONS = ['work', 'friends', 'date', 'event', 'casual', 'sport', 'travel'] as const;
const HISTORY_DAYS = 14;

export const todayQuerySchema = z.object({
  occasion: z.enum(OCCASIONS).default('work'),
  /** The user's local calendar day (YYYY-MM-DD); defaults to today in UTC. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  refresh: z.enum(['1', 'true']).optional(),
});

export const feedbackSchema = z.object({ value: z.enum(['like', 'dislike']) });
export const dateBodySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });

export type OutfitWithItems = Outfit & { items: (OutfitItem & { item: Item })[] };

export interface TodayResponse {
  date: string;
  occasion: Occasion;
  outfits: OutfitWithItems[];
  refreshesLeft: number;
  /** True when the closet is too small to fill a template; the app asks for more items. */
  closetTooSmall: boolean;
}

export const toUtcDate = (ymd?: string): Date => (ymd ? new Date(`${ymd}T00:00:00.000Z`) : new Date(new Date().toISOString().slice(0, 10)));
export const ymdOf = (d: Date): string => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number): Date => new Date(d.getTime() + n * 86_400_000);

export const toEngineItem = (i: Item): EngineItem => ({
  id: i.id,
  name: i.name,
  category: i.category,
  subcategory: i.subcategory,
  primaryColor: i.primaryColor,
  secondaryColor: i.secondaryColor,
  pattern: i.pattern,
  formality: i.formality,
  warmth: i.warmth,
  seasons: i.seasons,
  occasions: i.occasions,
  starterKey: i.starterKey,
});

@Injectable()
export class OutfitsService {
  private readonly reasons: ReasonProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly quota: QuotaService,
    private readonly profiles: StyleProfileService,
    @Optional() @Inject(REASON_PROVIDER) reasons?: ReasonProvider,
  ) {
    this.reasons = reasons ?? new TemplateReasonProvider();
  }

  /** Today's 3 outfits for an occasion, generated once per user/date/occasion; `refresh` regenerates (free: limited). */
  async today(userId: string, query: unknown): Promise<TodayResponse> {
    const parsed = todayQuerySchema.safeParse(query ?? {});
    if (!parsed.success) throw new BadRequestException({ code: 'INVALID_QUERY', message: 'Invalid query' });
    const { occasion } = parsed.data;
    const date = toUtcDate(parsed.data.date);
    const refresh = !!parsed.data.refresh;

    const existing = await this.findDay(userId, date, occasion);
    if (existing.length && !refresh) return this.respond(userId, date, occasion, existing, false);

    const excludeKeys = new Set<string>();
    let seed = 0;
    if (existing.length) {
      await this.quota.assertCanRefresh(userId, date);
      await this.prisma.outfitRefresh.create({ data: { userId, date, occasion } });
      for (const o of existing) excludeKeys.add(outfitKey(o.items.map((x) => x.item)));
      seed = Date.now() % 1_000_000;
      await this.prisma.outfit.deleteMany({ where: { userId, date, occasion, status: 'suggested' } });
    }

    const [items, profile, history] = await Promise.all([
      this.prisma.item.findMany({ where: { userId, archivedAt: null } }),
      this.engineProfile(userId),
      this.history(userId, date),
    ]);
    const { suggestions } = suggestOutfits(
      { items: items.map(toEngineItem), profile, history, occasion, season: seasonOf(date), excludeKeys, seed },
      this.reasons,
    );

    if (suggestions.length) {
      await this.prisma.$transaction(
        suggestions.map((s) =>
          this.prisma.outfit.create({
            data: {
              userId,
              date,
              occasion,
              score: s.score.total,
              reason: s.reason,
              template: s.template,
              items: { create: Object.entries(s.slots).map(([slot, item]) => ({ slot: slot as OutfitSlot, itemId: item.id })) },
            },
          }),
        ),
      );
    }
    const saved = await this.findDay(userId, date, occasion);
    return this.respond(userId, date, occasion, saved, suggestions.length === 0);
  }

  async wear(userId: string, id: string, body: unknown): Promise<OutfitWithItems> {
    const parsed = dateBodySchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException({ code: 'INVALID_DATE', message: 'Invalid date' });
    const outfit = await this.getOwned(userId, id);
    const wornOn = toUtcDate(parsed.data.date);
    await this.prisma.$transaction([
      this.prisma.wear.upsert({ where: { outfitId_wornOn: { outfitId: outfit.id, wornOn } }, create: { userId, outfitId: outfit.id, wornOn }, update: {} }),
      this.prisma.outfit.update({ where: { id: outfit.id }, data: { status: 'worn' } }),
    ]);
    return this.getOwned(userId, id);
  }

  async save(userId: string, id: string): Promise<OutfitWithItems> {
    const outfit = await this.getOwned(userId, id);
    if (outfit.status === 'suggested') await this.prisma.outfit.update({ where: { id }, data: { status: 'saved' } });
    return this.getOwned(userId, id);
  }

  async feedback(userId: string, id: string, body: unknown): Promise<{ ok: true }> {
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException({ code: 'INVALID_FEEDBACK', message: 'Invalid feedback' });
    await this.getOwned(userId, id);
    await this.prisma.outfitFeedback.create({ data: { userId, outfitId: id, value: parsed.data.value } });
    return { ok: true };
  }

  listSaved(userId: string): Promise<OutfitWithItems[]> {
    return this.prisma.outfit.findMany({
      where: { userId, status: { in: ['saved', 'worn'] } },
      include: { items: { include: { item: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
  }

  private async respond(userId: string, date: Date, occasion: Occasion, outfits: OutfitWithItems[], closetTooSmall: boolean): Promise<TodayResponse> {
    const refresh = await this.quota.getRefreshState(userId, date);
    return { date: ymdOf(date), occasion, outfits, refreshesLeft: refresh.isPro ? -1 : refresh.left, closetTooSmall };
  }

  private findDay(userId: string, date: Date, occasion: Occasion): Promise<OutfitWithItems[]> {
    return this.prisma.outfit.findMany({
      where: { userId, date, occasion },
      include: { items: { include: { item: true } } },
      orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
    });
  }

  private async getOwned(userId: string, id: string): Promise<OutfitWithItems> {
    const outfit = await this.prisma.outfit.findFirst({ where: { id, userId }, include: { items: { include: { item: true } } } });
    if (!outfit) throw new NotFoundException('Outfit not found');
    return outfit;
  }

  /** Dress code + tags from liked / disliked onboarding looks (look → starter items → tags). */
  private async engineProfile(userId: string): Promise<EngineProfile> {
    const profile = await this.profiles.get(userId);
    const likedTags = new Set<string>();
    const dislikedTags = new Set<string>();
    for (const swipe of profile.swipes) {
      const look = getLook(swipe.lookId);
      if (!look) continue;
      const items = look.starterKeys.map(getStarterItem).filter((s): s is NonNullable<typeof s> => !!s);
      for (const tag of tagsOfItems(items)) (swipe.liked ? likedTags : dislikedTags).add(tag);
    }
    return { dressCode: profile.dressCode, likedTags, dislikedTags };
  }

  private async history(userId: string, date: Date): Promise<WearHistory> {
    const since = addDays(date, -HISTORY_DAYS);
    const yesterday = ymdOf(addDays(date, -1));
    const wears = await this.prisma.wear.findMany({
      where: { userId, wornOn: { gte: since, lt: date } },
      include: { outfit: { include: { items: { select: { itemId: true } } } } },
    });
    const history: WearHistory = { wornYesterday: new Set(), recentOutfitKeys: new Set(), wearCount: new Map() };
    for (const w of wears) {
      const ids = w.outfit.items.map((i) => ({ id: i.itemId }));
      history.recentOutfitKeys.add(outfitKey(ids));
      for (const { id } of ids) {
        history.wearCount.set(id, (history.wearCount.get(id) ?? 0) + 1);
        if (ymdOf(w.wornOn) === yesterday) history.wornYesterday.add(id);
      }
    }
    return history;
  }
}

export type OutfitCreateInput = Prisma.OutfitCreateInput;
