import { BadRequestException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import type { Item, Occasion, OutfitSlot } from '@prisma/client';
import { EntitlementService } from '../billing/entitlement.service';
import { ENV, type Env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { scoreCandidate, suggestOutfits } from './engine/engine';
import { seasonOf } from './engine/filters';
import { TemplateReasonProvider, type ReasonProvider } from './engine/reasons';
import { canFillAnyTemplate, SLOT_CATEGORY } from './engine/templates';
import type { Candidate, EngineItem, SlotMap } from './engine/types';
import { applyBrief, ideasBodySchema, saveManySchema, splitIdeas, type Idea, type IdeasBody, type LockedIdea } from './ideas.rules';
import { OutfitsService, REASON_PROVIDER, toEngineItem, toUtcDate, ymdOf, type OutfitWithItems } from './outfits.service';

export interface IdeasResponse {
  date: string;
  occasion: Occasion;
  vibe: IdeasBody['vibe'];
  formality: number;
  isPro: boolean;
  /** Ideas shown in full (Free: the first `freeVisible`; Pro: all). */
  ideas: Idea<Item>[];
  /** Pro-only ideas as silhouettes for Free users (never item ids). */
  locked: LockedIdea[];
  lockedCount: number;
  freeVisible: number;
  proMax: number;
  closetTooSmall: boolean;
}

/**
 * Outfit ideas from the quick questions (board 05 → 06). Nothing is persisted on generate; `saveMany`
 * stores only the ideas the user picked (as `saved` outfits), after checking they own every item.
 */
@Injectable()
export class IdeasService {
  private readonly reasons: ReasonProvider;

  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly prisma: PrismaService,
    private readonly entitlements: EntitlementService,
    private readonly outfits: OutfitsService,
    @Optional() @Inject(REASON_PROVIDER) reasons?: ReasonProvider,
  ) {
    this.reasons = reasons ?? new TemplateReasonProvider();
  }

  async ideas(userId: string, body: unknown): Promise<IdeasResponse> {
    const parsed = ideasBodySchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException({ code: 'INVALID_BRIEF', message: 'Invalid brief' });
    const brief = parsed.data;
    const date = toUtcDate(brief.date);
    const limits = { isPro: await this.entitlements.isPro(userId), freeVisible: this.env.FREE_IDEAS_VISIBLE, proMax: this.env.PRO_IDEAS_MAX };

    const [items, ctx] = await Promise.all([this.prisma.item.findMany({ where: { userId, archivedAt: null } }), this.outfits.engineContext(userId, date)]);
    const byId = new Map(items.map((i) => [i.id, i]));
    const { suggestions } = suggestOutfits(
      {
        items: items.map(toEngineItem),
        profile: applyBrief(ctx.profile, brief),
        history: ctx.history,
        occasion: brief.occasion,
        season: seasonOf(date),
        seed: brief.formality * 7 + brief.vibe.length,
        count: limits.proMax,
      },
      this.reasons,
    );
    const split = splitIdeas(suggestions, limits, (id) => byId.get(id)!);
    return {
      date: ymdOf(date),
      occasion: brief.occasion,
      vibe: brief.vibe,
      formality: brief.formality,
      isPro: limits.isPro,
      ...split,
      freeVisible: limits.freeVisible,
      proMax: limits.proMax,
      closetTooSmall: suggestions.length === 0,
    };
  }

  /** Saves several ideas at once as `saved` outfits; 404 when any item is not the user's. */
  async saveMany(userId: string, body: unknown): Promise<OutfitWithItems[]> {
    const parsed = saveManySchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException({ code: 'INVALID_IDEAS', message: 'Invalid ideas' });
    const { occasion, ideas } = parsed.data;
    const date = toUtcDate(parsed.data.date);

    const ids = [...new Set(ideas.flatMap((i) => i.itemIds))];
    const owned = await this.prisma.item.findMany({ where: { id: { in: ids }, userId, archivedAt: null } });
    if (owned.length !== ids.length) throw new NotFoundException('Item not found');
    const byId = new Map(owned.map((i) => [i.id, toEngineItem(i)]));

    const ctx = await this.outfits.engineContext(userId, date);
    const candidates: Candidate[] = ideas.map((idea) => {
      const slots: SlotMap = {};
      for (const id of idea.itemIds) {
        const item = byId.get(id)!;
        const slot = this.slotOf(item);
        if (slots[slot]) throw new BadRequestException({ code: 'INVALID_IDEA', message: `Two items for the ${slot} slot` });
        slots[slot] = item;
      }
      const items = Object.values(slots) as EngineItem[];
      if (!canFillAnyTemplate(items)) throw new BadRequestException({ code: 'INVALID_IDEA', message: 'An outfit needs a top, bottom and shoes, or a dress and shoes' });
      return { template: idea.template, slots, items };
    });

    const created = await this.prisma.$transaction(
      candidates.map((c) => {
        const score = scoreCandidate(c, ctx);
        return this.prisma.outfit.create({
          data: {
            userId,
            date,
            occasion,
            score: score.total,
            reason: this.reasons.reason(c, { occasion, score }),
            template: c.template,
            status: 'saved',
            items: { create: Object.entries(c.slots).map(([slot, item]) => ({ slot: slot as OutfitSlot, itemId: item.id })) },
          },
          include: { items: { include: { item: true } } },
        });
      }),
    );
    return created;
  }

  private slotOf(item: EngineItem): OutfitSlot {
    return (Object.keys(SLOT_CATEGORY) as OutfitSlot[]).find((s) => SLOT_CATEGORY[s] === item.category)!;
  }
}
