import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  FAL_KEY: z.string().min(1),
  REVENUECAT_SECRET_KEY: z.string().min(1),
  FREE_DAILY_LIMIT: z.coerce.number().int().min(0).default(3),
  PRO_DAILY_LIMIT: z.coerce.number().int().min(0).default(50),
  /** Free closet size; Pro is unlimited. */
  FREE_ITEM_LIMIT: z.coerce.number().int().min(0).default(50),
  /** Free `GET /outfits/today?refresh=1` regenerations per day; Pro is unlimited. */
  FREE_REFRESH_LIMIT: z.coerce.number().int().min(0).default(1),
  /** `POST /outfits/ideas`: how many ideas Free sees unlocked; the rest come back as locked silhouettes. */
  FREE_IDEAS_VISIBLE: z.coerce.number().int().min(0).default(3),
  /** `POST /outfits/ideas`: how many ideas Pro gets (and Free is told about). */
  PRO_IDEAS_MAX: z.coerce.number().int().min(1).default(12),
  PORT: z.coerce.number().int().positive().default(3000),
});

export type Env = z.infer<typeof envSchema>;

export const ENV = Symbol('ENV');

/** Parses env and throws (fail fast) listing only the invalid key names, never values. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Invalid environment configuration: ${keys}`);
  }
  return parsed.data;
}
