import { z } from 'zod';

export interface ModelDef {
  endpoint: string;
  input: z.ZodType<Record<string, unknown>>;
}

const IMAGE_SIZES = [
  'square_hd',
  'square',
  'portrait_4_3',
  'portrait_16_9',
  'landscape_4_3',
  'landscape_16_9',
] as const;

export const MODELS: Record<string, ModelDef> = {
  /** Background removal for photo items: `{ image_url }` → `{ image: { url } }`. */
  'birefnet-v2': {
    endpoint: 'fal-ai/birefnet/v2',
    input: z
      .object({
        image_url: z.string().url(),
        refine_foreground: z.boolean().optional(),
        output_format: z.enum(['png', 'webp']).optional(),
      })
      .strict(),
  },
  /** Vision LLM used to auto-tag a garment photo: `{ prompt, model, image_urls }` → `{ output: string }`. */
  'vision-tagger': {
    endpoint: 'openrouter/router/vision',
    input: z
      .object({
        prompt: z.string().min(1).max(4000),
        system_prompt: z.string().max(1000).optional(),
        model: z.enum(['google/gemini-2.5-flash-lite', 'google/gemini-2.5-flash']),
        image_urls: z.array(z.string().url()).min(1).max(1),
        temperature: z.number().min(0).max(1).optional(),
        max_tokens: z.number().int().min(1).max(2000).optional(),
      })
      .strict(),
  },
  'flux-schnell': {
    endpoint: 'fal-ai/flux/schnell',
    input: z
      .object({
        prompt: z.string().min(1).max(500),
        image_size: z.enum(IMAGE_SIZES).optional(),
      })
      .strict(),
  },
};

export type ParseModelResult =
  | { ok: true; modelId: string; endpoint: string; input: Record<string, unknown> }
  | { ok: false; code: 'UNKNOWN_MODEL' | 'INVALID_INPUT'; message: string };

export function getModel(model: string): ModelDef | undefined {
  return Object.prototype.hasOwnProperty.call(MODELS, model) ? MODELS[model] : undefined;
}

export function parseModelInput(model: unknown, input: unknown): ParseModelResult {
  const def = typeof model === 'string' ? getModel(model) : undefined;
  if (!def) return { ok: false, code: 'UNKNOWN_MODEL', message: 'Unknown model' };
  const parsed = def.input.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join('.') || 'input'}: ${i.message}`).join('; ');
    return { ok: false, code: 'INVALID_INPUT', message: msg };
  }
  return { ok: true, modelId: model as string, endpoint: def.endpoint, input: parsed.data };
}
