import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Generation, Prisma } from '@prisma/client';
import { QuotaService } from '../billing/quota.service';
import { FalService } from '../fal/fal.service';
import { getModel, parseModelInput } from '../fal/models';
import { isFinal } from '../fal/status';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenerationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fal: FalService,
    private readonly quota: QuotaService,
  ) {}

  async create(userId: string, body: unknown): Promise<Generation> {
    const { model, input } = (body ?? {}) as { model?: unknown; input?: unknown };
    const parsed = parseModelInput(model, input);
    if (!parsed.ok) throw new BadRequestException({ code: parsed.code, message: parsed.message });

    await this.quota.assertCanGenerate(userId);

    const { requestId } = await this.fal.submit(parsed.endpoint, parsed.input);
    return this.prisma.generation.create({
      data: {
        userId,
        model: parsed.modelId,
        falRequestId: requestId,
        status: 'queued',
        input: parsed.input as Prisma.InputJsonValue,
      },
    });
  }

  async get(userId: string, id: string): Promise<Generation> {
    const gen = await this.prisma.generation.findFirst({ where: { id, userId } });
    if (!gen) throw new NotFoundException('Generation not found');
    if (isFinal(gen.status)) return gen;

    const def = getModel(gen.model);
    if (!def) return gen;
    const polled = await this.fal.poll(def.endpoint, gen.falRequestId);
    if (polled.status === gen.status && !polled.resultUrl && !polled.error) return gen;

    return this.prisma.generation.update({
      where: { id: gen.id },
      data: { status: polled.status, resultUrl: polled.resultUrl ?? null, error: polled.error ?? null },
    });
  }

  list(userId: string): Promise<Generation[]> {
    return this.prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
