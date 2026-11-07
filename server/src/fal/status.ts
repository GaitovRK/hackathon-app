import type { GenerationStatus } from '@prisma/client';

/** Maps a fal queue status to our GenerationStatus. Anything unknown maps to failed. */
export function mapFalStatus(falStatus: string | undefined | null): GenerationStatus {
  switch (falStatus) {
    case 'IN_QUEUE':
      return 'queued';
    case 'IN_PROGRESS':
      return 'running';
    case 'COMPLETED':
      return 'done';
    default:
      return 'failed';
  }
}

/** Extracts images[0].url from a fal image result payload. */
export function extractImageUrl(data: unknown): string | null {
  const images = (data as { images?: Array<{ url?: unknown }> } | null)?.images;
  const url = Array.isArray(images) ? images[0]?.url : undefined;
  return typeof url === 'string' ? url : null;
}

export function isFinal(status: GenerationStatus): boolean {
  return status === 'done' || status === 'failed';
}
