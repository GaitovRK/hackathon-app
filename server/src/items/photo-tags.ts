import { z } from 'zod';

/** Enum values mirrored from prisma/schema.prisma (kept in sync by the e2e tests that create items). */
export const ITEM_CATEGORIES = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'] as const;
export const COLORS = ['white', 'black', 'grey', 'navy', 'beige', 'camel', 'brown', 'olive', 'blue', 'light_blue', 'red', 'burgundy', 'pink', 'green', 'yellow', 'orange', 'purple', 'cream'] as const;
export const PATTERNS = ['solid', 'stripe', 'check', 'print', 'texture'] as const;
export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export const OCCASIONS = ['work', 'friends', 'date', 'event', 'casual', 'sport', 'travel'] as const;

export const photoTagsSchema = z.object({
  category: z.enum(ITEM_CATEGORIES),
  subcategory: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(80),
  primaryColor: z.enum(COLORS),
  secondaryColor: z.enum(COLORS).nullable().optional(),
  pattern: z.enum(PATTERNS),
  formality: z.number().int().min(1).max(5),
  warmth: z.number().int().min(1).max(5),
  seasons: z.array(z.enum(SEASONS)).max(4),
  occasions: z.array(z.enum(OCCASIONS)).max(7),
});

export type PhotoTags = z.infer<typeof photoTagsSchema>;

/** Used when the vision model fails or answers with something we cannot validate. */
export const DEFAULT_PHOTO_TAGS: PhotoTags = {
  category: 'top',
  subcategory: 'top',
  name: 'My item',
  primaryColor: 'grey',
  secondaryColor: null,
  pattern: 'solid',
  formality: 3,
  warmth: 3,
  seasons: [...SEASONS],
  occasions: ['casual'],
};

export const TAGGING_SYSTEM_PROMPT = 'You tag clothing photos for a digital closet. Reply with one JSON object only, no prose, no markdown.';

export const TAGGING_PROMPT = [
  'Look at the garment in the photo and return strict JSON with exactly these keys:',
  `category: one of ${ITEM_CATEGORIES.join(', ')}`,
  'subcategory: short lowercase noun like "shirt", "chinos", "sneakers" (max 40 chars)',
  'name: short human name like "Navy knit sweater" (max 80 chars)',
  `primaryColor: one of ${COLORS.join(', ')}`,
  `secondaryColor: one of the same colours or null`,
  `pattern: one of ${PATTERNS.join(', ')}`,
  'formality: integer 1 (very casual) to 5 (formal)',
  'warmth: integer 1 (very light) to 5 (very warm)',
  `seasons: array of ${SEASONS.join(', ')}`,
  `occasions: array of ${OCCASIONS.join(', ')}`,
].join('\n');

/** Pulls the first JSON object out of a model answer (tolerates ``` fences and prose around it). */
export function extractJsonObject(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('No JSON object in model output');
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

export type ParsedPhotoTags = { tagged: true; tags: PhotoTags } | { tagged: false; tags: PhotoTags };

/** Validates a vision model answer; anything invalid falls back to DEFAULT_PHOTO_TAGS with `tagged: false`. */
export function parsePhotoTags(output: unknown): ParsedPhotoTags {
  try {
    const raw = typeof output === 'string' ? extractJsonObject(output) : output;
    const parsed = photoTagsSchema.safeParse(raw);
    if (!parsed.success) return { tagged: false, tags: DEFAULT_PHOTO_TAGS };
    const tags = parsed.data;
    return {
      tagged: true,
      tags: {
        ...tags,
        secondaryColor: tags.secondaryColor ?? null,
        seasons: tags.seasons.length ? [...new Set(tags.seasons)] : [...SEASONS],
        occasions: tags.occasions.length ? [...new Set(tags.occasions)] : ['casual'],
      },
    };
  } catch {
    return { tagged: false, tags: DEFAULT_PHOTO_TAGS };
  }
}
