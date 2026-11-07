import { Inject, Injectable, Logger } from '@nestjs/common';
import { fal } from '@fal-ai/client';
import type { GenerationStatus } from '@prisma/client';
import { ENV, type Env } from '../config/env';
import { extractImageUrl, mapFalStatus } from './status';

export interface FalPollResult {
  status: GenerationStatus;
  resultUrl?: string | null;
  error?: string | null;
}

@Injectable()
export class FalService {
  private readonly logger = new Logger(FalService.name);

  constructor(@Inject(ENV) env: Env) {
    fal.config({ credentials: env.FAL_KEY });
  }

  /** Uploads bytes to fal storage; returns the hosted URL (never log it). */
  async upload(data: Buffer, contentType: string): Promise<string> {
    return fal.storage.upload(new Blob([new Uint8Array(data)], { type: contentType }));
  }

  /** Runs an allowlisted endpoint synchronously (queue + wait) and returns the raw result data. */
  async run(endpoint: string, input: Record<string, unknown>, timeoutMs = 45_000): Promise<unknown> {
    const res = await fal.subscribe(endpoint, { input, logs: false, timeout: timeoutMs, pollInterval: 1000 });
    return res.data;
  }

  async submit(endpoint: string, input: Record<string, unknown>): Promise<{ requestId: string }> {
    const res = await fal.queue.submit(endpoint, { input });
    return { requestId: res.request_id };
  }

  async poll(endpoint: string, requestId: string): Promise<FalPollResult> {
    try {
      const st = await fal.queue.status(endpoint, { requestId, logs: false });
      const status = mapFalStatus(st.status);
      if (status === 'failed') return { status, error: 'Generation failed' };
      if (status !== 'done') return { status };
      const result = await fal.queue.result(endpoint, { requestId });
      const url = extractImageUrl(result.data);
      return url ? { status: 'done', resultUrl: url } : { status: 'failed', error: 'No image in result' };
    } catch (e) {
      this.logger.warn(`fal poll failed (${(e as Error).name})`);
      return { status: 'failed', error: 'Generation failed' };
    }
  }
}
