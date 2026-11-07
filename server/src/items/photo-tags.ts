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

/** One garment the vision model found: tags plus a short visual description for the flat-lay prompt. */
export const photoGarmentSchema = photoTagsSchema.extend({ description: z.string().trim().min(1).max(200) });
export type PhotoGarment = z.infer<typeof photoGarmentSchema>;

export const MAX_GARMENTS_PER_PHOTO = 4;
/** `garments: []` = the photo shows no clothing. The model may list more than 4; we keep the first 4. */
export const photoGarmentsSchema = z.object({ garments: z.array(photoGarmentSchema).max(20) });

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

/** Used for the flat-lay prompt when the vision model fails: one unknown garment. */
export const DEFAULT_PHOTO_GARMENT: PhotoGarment = { ...DEFAULT_PHOTO_TAGS, description: 'garment' };

export const TAGGING_SYSTEM_PROMPT = 'You tag clothing photos for a digital closet. Reply with one JSON object only, no prose, no markdown.';

export const TAGGING_PROMPT = [
  `List every distinct garment clearly visible in the photo (worn, on a hanger, flat, in a mirror selfie), at most ${MAX_GARMENTS_PER_PHOTO}.`,
  'Ignore small accessories (jewellery, belts, watches, socks) unless the photo is only that accessory. Skip people, furniture and background.',
  'If there is no clothing at all, return {"garments": []}.',
  'Return strict JSON {"garments": [ ... ]} where each garment has exactly these keys:',
  `category: one of ${ITEM_CATEGORIES.join(', ')}`,
  'subcategory: short lowercase noun like "shirt", "chinos", "sneakers" (max 40 chars)',
  'name: short human name like "Navy knit sweater" (max 80 chars)',
  'description: short visual description for an image prompt, e.g. "cream cable-knit cropped cardigan with gold buttons" (max 200 chars)',
  `primaryColor: one of ${COLORS.join(', ')}`,
  `secondaryColor: one of the same colours or null`,
  `pattern: one of ${PATTERNS.join(', ')}`,
  'formality: integer 1 (very casual) to 5 (formal)',
  'warmth: integer 1 (very light) to 5 (very warm)',
  `seasons: array of ${SEASONS.join(', ')}`,
  `occasions: array of ${OCCASIONS.join(', ')}`,
].join('\n');

/** Fixed style prompt for the image-edit model: one garment from the reference photo as a starter-style flat-lay. */
export function buildFlatLayPrompt(description: string): string {
  const what = description.trim().replace(/\s+/g, ' ').slice(0, 200) || 'garment';
  return (
    `Product flat-lay photo of only the ${what} from the reference image, laid flat and facing the camera, ` +
    'shot from directly above, centered, the whole garment visible and filling the frame, plain pure white background, ' +
    'soft even studio light, no shadow, no person, no body, no hanger, no mannequin, no other clothing, no text.'
  );
}

/** Pulls the first JSON object out of a model answer (tolerates ``` fences and prose around it). */
export function extractJsonObject(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('No JSON object in model output');
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

export type ParsedPhotoGarments =
  /** Valid answer; `garments` empty = no clothing in the photo. */
  | { tagged: true; garments: PhotoGarment[] }
  /** Model failed or answered nonsense: one default garment. */
  | { tagged: false; garments: [PhotoGarment] };

function normalizeGarment(g: PhotoGarment): PhotoGarment {
  return {
    ...g,
    secondaryColor: g.secondaryColor ?? null,
    seasons: g.seasons.length ? [...new Set(g.seasons)] : [...SEASONS],
    occasions: g.occasions.length ? [...new Set(g.occasions)] : ['casual'],
  };
}

/**
 * Validates a vision model answer `{ garments: [...] }`; keeps at most MAX_GARMENTS_PER_PHOTO.
 * Anything invalid falls back to one DEFAULT_PHOTO_GARMENT with `tagged: false`.
 */
export function parsePhotoGarments(output: unknown): ParsedPhotoGarments {
  try {
    const raw = typeof output === 'string' ? extractJsonObject(output) : output;
    const parsed = photoGarmentsSchema.safeParse(raw);
    if (!parsed.success) return { tagged: false, garments: [DEFAULT_PHOTO_GARMENT] };
    return { tagged: true, garments: parsed.data.garments.slice(0, MAX_GARMENTS_PER_PHOTO).map(normalizeGarment) };
  } catch {
    return { tagged: false, garments: [DEFAULT_PHOTO_GARMENT] };
  }
}
