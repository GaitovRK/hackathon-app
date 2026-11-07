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
