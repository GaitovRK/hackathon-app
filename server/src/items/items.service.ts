import { BadGatewayException, BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Item } from '@prisma/client';
import { z } from 'zod';
import { QuotaService } from '../billing/quota.service';
import { FalService } from '../fal/fal.service';
import { getModel } from '../fal/models';
import { PrismaService } from '../prisma/prisma.service';
import { getStarterItem } from '../starter-catalog/catalog';
import { COLORS, ITEM_CATEGORIES, parsePhotoTags, TAGGING_PROMPT, TAGGING_SYSTEM_PROMPT } from './photo-tags';

export const PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'] as const;
export const PHOTO_MAX_BYTES = 20 * 1024 * 1024;

export interface UploadedPhoto {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface PhotoItemResult {
  item: Item;
  tagged: boolean;
}

const cutoutResultSchema = z.object({ image: z.object({ url: z.string().url() }) });
const visionResultSchema = z.object({ output: z.string() });

export const addStarterSchema = z.object({ starterKeys: z.array(z.string().min(1).max(64)).min(1).max(100) });

export const patchItemSchema = z
  .object({
    category: z.enum(ITEM_CATEGORIES),
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
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly quota: QuotaService,
    private readonly fal: FalService,
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

  /**
   * Photo item: item-limit check → SourcePhoto → fal storage upload → background removal (birefnet) →
   * vision auto-tag (defaults + `tagged: false` on any tagging failure) → Item (source `photo`).
   * Cutout failure: SourcePhoto `failed` + 502 PHOTO_PROCESSING_FAILED.
   */
  async addFromPhoto(userId: string, photo: UploadedPhoto | undefined): Promise<PhotoItemResult> {
    if (!photo || !(PHOTO_MIME_TYPES as readonly string[]).includes(photo.mimetype) || photo.size > PHOTO_MAX_BYTES || photo.size === 0) {
      throw new BadRequestException({ code: 'INVALID_PHOTO', message: 'Send one jpeg, png, heic or webp photo up to 20 MB in the "photo" field' });
    }
    await this.quota.assertCanAddItems(userId, 1);

    const sourcePhoto = await this.prisma.sourcePhoto.create({ data: { userId, url: '', status: 'uploaded' } });
    let originalUrl: string;
    let cutoutUrl: string;
    try {
      originalUrl = await this.fal.upload(photo.buffer, photo.mimetype);
      await this.prisma.sourcePhoto.update({ where: { id: sourcePhoto.id }, data: { url: originalUrl, status: 'processing' } });
      const cutout = getModel('birefnet-v2')!;
      const result = await this.fal.run(cutout.endpoint, cutout.input.parse({ image_url: originalUrl, output_format: 'png' }));
      cutoutUrl = cutoutResultSchema.parse(result).image.url;
    } catch (e) {
      this.logger.warn(`photo cutout failed for sourcePhoto ${sourcePhoto.id} (${(e as Error).name})`);
      await this.prisma.sourcePhoto.update({ where: { id: sourcePhoto.id }, data: { status: 'failed', error: 'Background removal failed' } });
      throw new BadGatewayException({ code: 'PHOTO_PROCESSING_FAILED', message: 'We could not process that photo. Try another one.' });
    }

    const { tagged, tags } = await this.tagPhoto(originalUrl, sourcePhoto.id);
    const [item] = await this.prisma.$transaction([
      this.prisma.item.create({
        data: {
          userId,
          source: 'photo',
          category: tags.category,
          subcategory: tags.subcategory,
          name: tags.name,
          primaryColor: tags.primaryColor,
          secondaryColor: tags.secondaryColor ?? null,
          pattern: tags.pattern,
          formality: tags.formality,
          warmth: tags.warmth,
          seasons: tags.seasons,
          occasions: tags.occasions,
          imageUrl: cutoutUrl,
          sourcePhotoId: sourcePhoto.id,
        },
      }),
      this.prisma.sourcePhoto.update({ where: { id: sourcePhoto.id }, data: { status: 'tagged' } }),
    ]);
    return { item, tagged };
  }

  private async tagPhoto(imageUrl: string, sourcePhotoId: string): Promise<ReturnType<typeof parsePhotoTags>> {
    try {
      const vision = getModel('vision-tagger')!;
      const input = vision.input.parse({
        prompt: TAGGING_PROMPT,
        system_prompt: TAGGING_SYSTEM_PROMPT,
        model: 'google/gemini-2.5-flash-lite',
        image_urls: [imageUrl],
        temperature: 0,
        max_tokens: 400,
      });
      const result = await this.fal.run(vision.endpoint, input, 30_000);
      return parsePhotoTags(visionResultSchema.parse(result).output);
    } catch (e) {
      this.logger.warn(`photo tagging failed for sourcePhoto ${sourcePhotoId} (${(e as Error).name})`);
      return parsePhotoTags(null);
    }
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
