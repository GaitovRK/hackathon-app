import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Item } from '@prisma/client';
import { z } from 'zod';
import { QuotaService } from '../billing/quota.service';
import { PrismaService } from '../prisma/prisma.service';
import { getStarterItem } from '../starter-catalog/catalog';

const COLORS = ['white', 'black', 'grey', 'navy', 'beige', 'camel', 'brown', 'olive', 'blue', 'light_blue', 'red', 'burgundy', 'pink', 'green', 'yellow', 'orange', 'purple', 'cream'] as const;

export const addStarterSchema = z.object({ starterKeys: z.array(z.string().min(1).max(64)).min(1).max(100) });

export const patchItemSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    subcategory: z.string().trim().min(1).max(40),
    primaryColor: z.enum(COLORS),
    secondaryColor: z.enum(COLORS).nullable(),
    pattern: z.enum(['solid', 'stripe', 'check', 'print', 'texture']),
    material: z.string().trim().max(40).nullable(),
    formality: z.number().int().min(1).max(5),
    warmth: z.number().int().min(1).max(5),
    seasons: z.array(z.enum(['spring', 'summer', 'autumn', 'winter'])).max(4),
    occasions: z.array(z.enum(['work', 'friends', 'date', 'event', 'casual', 'sport', 'travel'])).max(7),
  })
  .partial();

@Injectable()
export class ItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quota: QuotaService,
  ) {}

  list(userId: string): Promise<Item[]> {
    return this.prisma.item.findMany({ where: { userId, archivedAt: null }, orderBy: [{ category: 'asc' }, { createdAt: 'asc' }] });
  }

  /**
   * Bulk-add starter basics. Keys already in the closet are skipped (idempotent), unknown keys are a 400,
   * and the free item limit is checked against the number of *new* items (402 ITEM_LIMIT).
   */
  async addFromStarter(userId: string, body: unknown): Promise<Item[]> {
    const parsed = addStarterSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException({ code: 'INVALID_STARTER_KEYS', message: 'Invalid starter keys' });
    const keys = [...new Set(parsed.data.starterKeys)];
    const unknown = keys.filter((k) => !getStarterItem(k));
    if (unknown.length) throw new BadRequestException({ code: 'UNKNOWN_STARTER_KEY', message: `Unknown starter keys: ${unknown.join(', ')}` });

    const existing = await this.prisma.item.findMany({ where: { userId, archivedAt: null, starterKey: { in: keys } }, select: { starterKey: true } });
    const have = new Set(existing.map((e) => e.starterKey));
    const fresh = keys.filter((k) => !have.has(k));
    if (fresh.length) {
      await this.quota.assertCanAddItems(userId, fresh.length);
      await this.prisma.item.createMany({
        data: fresh.map((k) => {
          const s = getStarterItem(k)!;
          return {
            userId,
            source: 'starter' as const,
            category: s.category,
            subcategory: s.subcategory,
            name: s.name,
            primaryColor: s.primaryColor,
            secondaryColor: s.secondaryColor ?? null,
            pattern: s.pattern,
            material: s.material ?? null,
            formality: s.formality,
            warmth: s.warmth,
            seasons: s.seasons,
            occasions: s.occasions,
            starterKey: k,
          };
        }),
      });
    }
    return this.list(userId);
  }

  async patch(userId: string, id: string, body: unknown): Promise<Item> {
    const parsed = patchItemSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException({ code: 'INVALID_ITEM', message: 'Invalid item tags' });
    await this.getOwned(userId, id);
    return this.prisma.item.update({ where: { id }, data: parsed.data });
  }

  /** Soft delete: the item leaves the closet but stays on past outfits. */
  async archive(userId: string, id: string): Promise<Item> {
    await this.getOwned(userId, id);
    return this.prisma.item.update({ where: { id }, data: { archivedAt: new Date() } });
  }

  private async getOwned(userId: string, id: string): Promise<Item> {
    const item = await this.prisma.item.findFirst({ where: { id, userId, archivedAt: null } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }
}
