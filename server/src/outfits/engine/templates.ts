import type { ItemCategory, OutfitSlot, OutfitTemplate, Season } from '@prisma/client';
import type { Candidate, EngineItem, SlotMap } from './types';

export interface TemplateDef {
  base: OutfitTemplate;
  layered: OutfitTemplate;
  required: OutfitSlot[];
}

/** Slot templates: separates (top + bottom + shoes) or dress (dress + shoes), each optionally layered. */
export const TEMPLATES: TemplateDef[] = [
  { base: 'separates', layered: 'separates_layered', required: ['top', 'bottom', 'shoes'] },
  { base: 'dress', layered: 'dress_layered', required: ['dress', 'shoes'] },
];

export const SLOT_CATEGORY: Record<OutfitSlot, ItemCategory> = {
  top: 'top',
  bottom: 'bottom',
  dress: 'dress',
  outerwear: 'outerwear',
  shoes: 'shoes',
  accessory: 'accessory',
};

export const COLD_SEASONS = new Set<Season>(['autumn', 'winter']);

export type ByCategory = Record<ItemCategory, EngineItem[]>;

export function groupByCategory(items: EngineItem[]): ByCategory {
  const by: ByCategory = { top: [], bottom: [], dress: [], outerwear: [], shoes: [], accessory: [] };
  for (const i of items) by[i.category].push(i);
  return by;
}

/** True when at least one template can be filled from these items. */
export function canFillAnyTemplate(items: EngineItem[]): boolean {
  const by = groupByCategory(items);
  return TEMPLATES.some((t) => t.required.every((slot) => by[SLOT_CATEGORY[slot]].length > 0));
}

/** Every base combination (required slots only) for every template. `perSlotCap` keeps the product bounded. */
export function enumerateBaseCandidates(items: EngineItem[], perSlotCap = 12): Candidate[] {
  const by = groupByCategory(items);
  const out: Candidate[] = [];
  for (const t of TEMPLATES) {
    const pools = t.required.map((slot) => by[SLOT_CATEGORY[slot]].slice(0, perSlotCap));
    if (pools.some((p) => p.length === 0)) continue;
    const walk = (depth: number, slots: SlotMap) => {
      if (depth === t.required.length) {
        out.push({ template: t.base, slots: { ...slots }, items: Object.values(slots) as EngineItem[] });
        return;
      }
      for (const item of pools[depth]) {
        slots[t.required[depth]] = item;
        walk(depth + 1, slots);
      }
      delete slots[t.required[depth]];
    };
    walk(0, {});
  }
  return out;
}

export const templateOf = (base: OutfitTemplate, layered: boolean): OutfitTemplate => {
  if (!layered) return base;
  return base === 'dress' ? 'dress_layered' : 'separates_layered';
};

/** A copy of the candidate with one more slot filled. */
export function withSlot(c: Candidate, slot: OutfitSlot, item: EngineItem): Candidate {
  const slots = { ...c.slots, [slot]: item };
  return { template: slot === 'outerwear' ? templateOf(c.template, true) : c.template, slots, items: Object.values(slots) as EngineItem[] };
}
