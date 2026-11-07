import type { Color, Occasion } from '@prisma/client';
import { colorHarmony, NEUTRALS } from './harmony';
import type { Candidate, ScoreBreakdown } from './types';

export interface ReasonContext {
  occasion: Occasion;
  score: ScoreBreakdown;
}

/**
 * Produces the one-line "why" of an outfit. The template provider below is rules-based; an LLM
 * re-ranker (Claude) can implement the same interface later and be injected in `OutfitsService`.
 */
export interface ReasonProvider {
  reason(candidate: Candidate, ctx: ReasonContext): string;
}

const OCCASION_ADJ: Record<Occasion, string> = {
  work: 'sharp',
  friends: 'easy',
  date: 'put-together',
  event: 'polished',
  casual: 'relaxed',
  sport: 'ready to move',
  travel: 'comfortable',
};

const OCCASION_NOUN: Record<Occasion, string> = {
  work: 'work',
  friends: 'seeing friends',
  date: 'a date',
  event: 'an event',
  casual: 'a day off',
  sport: 'a workout',
  travel: 'travel',
};

export const colorName = (c: Color): string => c.replace('_', ' ');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export class TemplateReasonProvider implements ReasonProvider {
  reason(c: Candidate, ctx: ReasonContext): string {
    const adj = OCCASION_ADJ[ctx.occasion];
    const noun = OCCASION_NOUN[ctx.occasion];
    const h = colorHarmony(c.items);
    const colors = [...new Set(c.items.map((i) => i.primaryColor))];
    const pop = colors.find((x) => !NEUTRALS.has(x));

    let line: string;
    if (colors.length === 1) line = `${cap(colorName(colors[0]))} head to toe reads ${adj} for ${noun}`;
    else if (h.goodPairs.length) {
      // Name the pair in outfit order (top before bottom), not alphabetical.
      const [a, b] = (h.goodPairs[0].split('|') as [Color, Color]).sort((x, y) => colors.indexOf(x) - colors.indexOf(y));
      line = `${cap(colorName(a))} + ${colorName(b)} reads ${adj} for ${noun}`;
    } else if (pop) line = `One pop of ${colorName(pop)} on neutrals keeps it ${adj} for ${noun}`;
    else if (h.allNeutral) line = `All neutrals: a clean, ${adj} look for ${noun}`;
    else line = `${cap(colorName(colors[0]))} and ${colorName(colors[1])} keep it ${adj} for ${noun}`;

    if (c.slots.outerwear) line += `; the ${c.slots.outerwear.name.toLowerCase()} ties it together`;
    return `${line}.`;
  }
}
