import type { ItemCategory } from "@/services/api/types";
import { WOMEN_SHAPES } from "./garmentPaths.women";

/**
 * Garment stickers from `docs/design/flick-board.html` (100×100 viewBox): `body` is the die-cut
 * silhouette, `detail` the seam lines (`.dt`), `dots` the buttons (`.dot`). Picked by subcategory,
 * falling back to category.
 */
export type GarmentShape = { body: string; detail?: string; dots?: string };

const P = {
  shirt: "M33 12 L42 9 Q50 14 58 9 L67 12 L83 21 L94 69 L83 72 L74 41 L74 92 L26 92 L26 41 L17 72 L6 69 L17 21 Z",
  knit: "M31 14 Q50 22 69 14 L85 23 L95 72 L84 76 L76 44 L76 89 Q50 93 24 89 L24 44 L16 76 L5 72 L15 23 Z",
  trousers: "M28 7 L72 7 L79 93 L58 93 L50 36 L42 93 L21 93 Z",
  blazer: "M33 10 L44 8 L50 30 L56 8 L67 10 L85 21 L94 74 L84 76 L76 43 L76 91 L24 91 L24 43 L16 76 L6 74 L15 21 Z",
  coat: "M33 6 L44 4 L50 24 L56 4 L67 6 L85 18 L94 70 L84 73 L77 40 L81 96 L19 96 L23 40 L16 73 L6 70 L15 18 Z",
  dress: "M38 7 L44 7 Q50 13 56 7 L62 7 L66 30 L60 41 L83 94 Q50 98 17 94 L40 41 L34 30 Z",
  sneaker: "M7 63 Q8 47 22 45 L38 41 Q46 52 62 55 L84 60 Q94 63 93 73 L10 74 Q6 70 7 63 Z",
  loafer: "M7 64 Q9 52 25 50 L48 48 Q70 49 86 57 Q95 62 93 72 L11 72 Q6 70 7 64 Z",
  belt: "M5 43 H95 V57 H5 Z",
  watch: "M41 6 H59 L61 33 A20 20 0 0 1 61 67 L59 94 H41 L39 67 A20 20 0 0 1 39 33 Z",
  // Not on the board yet: derived in the same style.
  skirt: "M34 7 L66 7 L80 93 Q50 97 20 93 Z",
  boot: "M30 8 L64 8 L64 54 L88 62 Q95 66 93 74 L11 74 Q6 70 8 63 L30 56 Z",
  heel: "M10 60 L40 42 L64 26 L74 32 L54 56 L90 64 Q95 68 93 74 L24 74 L26 68 L30 62 Z",
  scarf: "M36 6 L64 6 L61 60 L78 94 L58 94 L50 72 L42 94 L22 94 L39 60 Z",
  bag: "M22 36 H78 L88 92 Q50 96 12 92 Z",
} as const;

export const SHAPES = {
  shirt: { body: P.shirt, detail: "M42 9 L50 21 L58 9 M50 21 V90 M58 33 h9 v9 h-9 Z M74 41 L72 30 M26 41 L28 30 M8 64 L17 67 M92 64 L83 67", dots: "M50 32 h.1 M50 46 h.1 M50 60 h.1 M50 74 h.1" },
  blouse: { body: P.shirt, detail: "M42 9 L50 21 L58 9 M50 21 V60 M74 41 L72 30 M26 41 L28 30 M8 64 L17 67 M92 64 L83 67" },
  tshirt: { body: P.knit, detail: "M37 16 Q50 26 63 16 M7 66 L17 69 M93 66 L83 69" },
  knit: { body: P.knit, detail: "M37 16 Q50 26 63 16 M25 82 Q50 86 75 82 M7 66 L17 69 M93 66 L83 69 M76 44 L74 32 M24 44 L26 32" },
  turtleneck: { body: P.knit, detail: "M37 16 Q50 26 63 16 M37 10 Q50 18 63 10 M25 82 Q50 86 75 82 M7 66 L17 69 M93 66 L83 69" },
  hoodie: { body: P.knit, detail: "M37 16 Q50 30 63 16 M42 16 Q50 8 58 16 M25 82 Q50 86 75 82 M38 60 h24 v18 h-24 Z M7 66 L17 69 M93 66 L83 69" },
  trousers: { body: P.trousers, detail: "M28.6 15 H71.4 M50 15 V34 M38 22 L32 88 M62 22 L68 88" },
  chinos: { body: P.trousers, detail: "M28.6 15 H71.4 M50 15 V34 M38 22 L32 88 M62 22 L68 88" },
  joggers: { body: P.trousers, detail: "M28.6 15 H71.4 M40 15 V22 M60 15 V22 M44 86 H56" },
  jeans: { body: P.trousers, detail: "M28.6 15 H71.4 M50 15 V34 M30 22 Q36 27 41 17 M70 22 Q64 27 59 17 M23 86 H41 M59 86 H77" },
  skirt: { body: P.skirt, detail: "M34.6 14 H65.4 M50 14 V40" },
  blazer: { body: P.blazer, detail: "M44 8 L38 28 L45 33 L50 56 L55 33 L62 28 L56 8 M50 56 V91 M29 66 H40 M60 66 H71 M62 41 H70", dots: "M53 64 h.1 M53 74 h.1" },
  jacket: { body: P.blazer, detail: "M44 8 L40 20 L50 30 L60 20 L56 8 M50 30 V91 M29 66 H40 M60 66 H71" },
  coat: { body: P.coat, detail: "M44 4 L37 22 L44 27 L50 46 L55 27 L63 22 L56 4 M50 46 V96 M22 55 H78 M45 52 h10 v6 h-10 Z" },
  trench: { body: P.coat, detail: "M44 4 L37 22 L44 27 L50 46 L55 27 L63 22 L56 4 M50 46 V96 M22 55 H78 M45 52 h10 v6 h-10 Z M30 30 L50 46 M70 30 L50 46" },
  dress: { body: P.dress, detail: "M40 41 H60 M50 43 L45 93 M56 50 L64 92" },
  midi: { body: P.dress, detail: "M40 41 H60 M50 43 L45 93 M56 50 L64 92" },
  shirt_dress: { body: P.dress, detail: "M40 41 H60 M50 13 V93", dots: "M50 24 h.1 M50 36 h.1 M50 52 h.1 M50 66 h.1 M50 80 h.1" },
  wrap: { body: P.dress, detail: "M40 41 H60 M44 13 L56 48 M56 13 L44 48 M50 48 L46 93" },
  sneakers: { body: P.sneaker, detail: "M8 67 H93 M33 44 L38 50 M39 42 L44 48 M45 47 L49 52 M14 57 Q20 51 27 53" },
  loafers: { body: P.loafer, detail: "M9 67 H92 M42 50 Q55 60 68 52 M50 56 L60 55" },
  oxfords: { body: P.loafer, detail: "M9 67 H92 M40 50 Q50 58 62 52 M44 52 L48 56 M50 51 L54 55" },
  heels: { body: P.heel, detail: "M24 74 H93" },
  boots: { body: P.boot, detail: "M30 20 H64 M11 68 H93 M30 56 L64 56" },
  belt: { body: P.belt, detail: "M14 40 h14 v20 h-14 Z M21 50 H8", dots: "M44 50 h.1 M52 50 h.1 M60 50 h.1" },
  watch: { body: P.watch, detail: "M50 50 V42 M50 50 L56 53 M41 14 H59 M41 86 H59" },
  scarf: { body: P.scarf, detail: "M39 60 H61 M26 86 L36 86 M64 86 L74 86" },
  bag: { body: P.bag, detail: "M36 36 Q36 12 50 12 Q64 12 64 36 M22 48 H78" },
  ...WOMEN_SHAPES,
} as const satisfies Record<string, GarmentShape>;

export type ShapeKey = keyof typeof SHAPES;

const CATEGORY_FALLBACK: Record<ItemCategory, ShapeKey> = { top: "tshirt", bottom: "trousers", dress: "dress", outerwear: "jacket", shoes: "sneakers", accessory: "belt" };

export function shapeFor(category: ItemCategory, subcategory: string): GarmentShape {
  const key = (subcategory in SHAPES ? subcategory : CATEGORY_FALLBACK[category]) as ShapeKey;
  return SHAPES[key];
}

/** Deterministic sticker tilt in [-max, max] from the garment name, so a given item always leans the same way. */
export function tiltFor(name: string, max: number): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000) * 2 * max - max;
}
