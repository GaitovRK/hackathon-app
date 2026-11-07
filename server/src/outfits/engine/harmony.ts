import type { Color, Pattern } from '@prisma/client';
import { clamp, type EngineItem } from './types';

export const NEUTRALS = new Set<Color>(['white', 'black', 'grey', 'navy', 'beige', 'camel', 'brown', 'cream', 'olive']);
/** Colors that fight for attention: at most one per outfit. */
export const LOUD = new Set<Color>(['red', 'pink', 'yellow', 'orange', 'purple', 'green']);

const pair = (a: Color, b: Color) => (a < b ? `${a}|${b}` : `${b}|${a}`);

/** Classic pairings (complementary / analogous / safe neutrals). */
const GOOD_PAIRS = new Set(
  [
    ['navy', 'camel'], ['navy', 'white'], ['navy', 'grey'], ['navy', 'beige'], ['navy', 'light_blue'], ['navy', 'cream'], ['navy', 'brown'],
    ['blue', 'camel'], ['blue', 'brown'], ['blue', 'white'], ['blue', 'beige'], ['blue', 'grey'], ['blue', 'navy'], ['blue', 'cream'],
    ['black', 'white'], ['black', 'grey'], ['black', 'camel'], ['black', 'cream'], ['black', 'beige'],
    ['grey', 'burgundy'], ['grey', 'pink'], ['grey', 'white'], ['grey', 'camel'], ['grey', 'light_blue'], ['grey', 'cream'],
    ['olive', 'cream'], ['olive', 'beige'], ['olive', 'white'], ['olive', 'black'], ['olive', 'camel'],
    ['camel', 'cream'], ['camel', 'white'], ['brown', 'cream'], ['brown', 'beige'], ['brown', 'white'],
    ['burgundy', 'navy'], ['burgundy', 'cream'], ['green', 'beige'], ['green', 'cream'], ['green', 'white'],
    ['light_blue', 'beige'], ['light_blue', 'white'], ['light_blue', 'brown'], ['red', 'navy'], ['red', 'white'], ['yellow', 'navy'], ['purple', 'grey'], ['pink', 'navy'],
  ].map(([a, b]) => pair(a as Color, b as Color)),
);

/** Pairings that clash. */
const CLASH_PAIRS = new Set(
  [
    ['red', 'pink'], ['red', 'orange'], ['orange', 'pink'], ['green', 'red'], ['purple', 'orange'], ['purple', 'green'], ['yellow', 'pink'],
    ['brown', 'black'], ['purple', 'red'], ['green', 'orange'], ['yellow', 'orange'],
  ].map(([a, b]) => pair(a as Color, b as Color)),
);

const PATTERNED = new Set<Pattern>(['stripe', 'check', 'print']);

export interface HarmonyResult {
  score: number;
  loudCount: number;
  goodPairs: string[];
  clashes: string[];
  patternClash: boolean;
  allNeutral: boolean;
}

/** Color + pattern harmony of an outfit, 0–100. Pure. */
export function colorHarmony(items: EngineItem[]): HarmonyResult {
  const primaries = [...new Set(items.map((i) => i.primaryColor))];
  let score = 50;
  const goodPairs: string[] = [];
  const clashes: string[] = [];

  for (let a = 0; a < primaries.length; a++) {
    for (let b = a + 1; b < primaries.length; b++) {
      const key = pair(primaries[a], primaries[b]);
      if (GOOD_PAIRS.has(key)) goodPairs.push(key);
      else if (CLASH_PAIRS.has(key)) clashes.push(key);
    }
  }
  score += Math.min(3, goodPairs.length) * 10;
  score -= clashes.length * 20;

  const loudCount = primaries.filter((c) => LOUD.has(c)).length;
  if (loudCount > 1) score -= 25 * (loudCount - 1);
  else if (loudCount === 1) score += 5; // one pop of color is good

  const allNeutral = primaries.every((c) => NEUTRALS.has(c) || c === 'light_blue');
  if (allNeutral) score += 10;
  if (primaries.length === 1 && items.length >= 3) score += 5; // monochrome reads deliberate

  const patterned = items.filter((i) => PATTERNED.has(i.pattern));
  const patternClash = patterned.length > 1;
  if (patternClash) score -= 15 * (patterned.length - 1);
  if (patterned.some((i) => i.pattern === 'stripe') && patterned.some((i) => i.pattern === 'check')) score -= 10;

  return { score: clamp(score), loudCount, goodPairs, clashes, patternClash, allNeutral };
}
