import type { GarmentShape } from "./garmentShapes";

/**
 * Womenswear garment stickers (decision #2: women first), same format as `SHAPES` in `garmentShapes.ts`:
 * 100×100 viewBox, `body` the die-cut silhouette, `detail` seam lines, `dots` buttons. Flat cutouts in the
 * board's style (design-e "Flick — Reference Direction"); keyed by starter `subcategory`. Spread into
 * `SHAPES` (the existing `skirt`, `blouse`, `heels`, `trench`, `belt` and `bag` stickers stay there).
 */
const P = {
  shell: "M34 12 L44 10 L50 24 L56 10 L66 12 L84 22 L95 66 L84 70 L74 42 L76 90 Q50 95 24 90 L26 42 L16 70 L5 66 L16 22 Z",
  cardigan: "M33 13 L42 11 L50 40 L58 11 L67 13 L85 23 L95 72 L84 76 L76 44 L76 89 Q50 93 24 89 L24 44 L16 76 L5 72 L15 23 Z",
  boatNeck: "M30 14 Q50 18 70 14 L85 23 L95 72 L84 76 L76 44 L76 89 Q50 93 24 89 L24 44 L16 76 L5 72 L15 23 Z",
  midiSkirt: "M34 8 L66 8 L68 16 L84 94 Q50 99 16 94 L32 16 Z",
  pleatedSkirt: "M33 8 L67 8 L69 16 L86 92 L76 95 L66 92 L58 95 L50 92 L42 95 L34 92 L24 95 L14 92 L31 16 Z",
  wideLeg: "M30 7 L70 7 L74 26 L92 93 L56 93 L50 40 L44 93 L8 93 L26 26 Z",
  croppedBlazer: "M33 14 L44 12 L50 32 L56 12 L67 14 L85 25 L94 76 L84 78 L76 47 L76 74 L24 74 L24 47 L16 78 L6 76 L15 25 Z",
  blazerDress: "M33 6 L44 4 L50 26 L56 4 L67 6 L85 17 L94 64 L84 67 L76 38 L78 94 L22 94 L24 38 L16 67 L6 64 L15 17 Z",
  slipDress: "M34 6 L38 6 L42 24 Q50 32 58 24 L62 6 L66 6 L67 30 L62 40 L80 94 Q50 99 20 94 L38 40 L33 30 Z",
  flats: "M8 66 Q8 50 22 50 L38 52 Q54 61 72 56 Q91 54 93 66 Q94 74 86 74 L14 74 Q7 73 8 66 Z",
  blockHeels: "M14 40 Q22 44 30 50 Q52 58 82 60 Q95 62 94 70 L92 74 L60 74 Q42 70 30 68 L28 90 L14 90 L12 62 Q11 48 14 40 Z",
  ankleBoots: "M22 10 L54 10 L56 40 Q60 52 84 58 Q95 62 94 70 L92 74 L60 74 Q44 70 36 70 L34 90 L20 90 L18 66 Q16 40 22 10 Z",
  tote: "M16 34 H84 L80 92 H20 Z",
} as const;

export const WOMEN_SHAPES = {
  shell: { body: P.shell, detail: "M44 10 L50 24 L56 10 M50 24 V38 M8 60 L17 64 M92 60 L83 64 M25 84 Q50 89 75 84" },
  cardigan: { body: P.cardigan, detail: "M50 40 V91 M25 82 Q50 86 75 82 M7 66 L17 69 M93 66 L83 69 M58 62 h10", dots: "M53 50 h.1 M53 62 h.1 M53 74 h.1" },
  breton: { body: P.boatNeck, detail: "M34 15 Q50 20 66 15 M7 66 L17 69 M93 66 L83 69" },
  midi_skirt: { body: P.midiSkirt, detail: "M32.5 16 H67.5 M44 22 L38 92 M56 22 L62 92" },
  pleated_skirt: { body: P.pleatedSkirt, detail: "M31 16 H69 M40 16 L24 93 M45 16 L42 93 M50 16 L50 92 M55 16 L58 93 M60 16 L76 93" },
  wide_leg: { body: P.wideLeg, detail: "M28.5 15 H71.5 M50 15 V36 M36 22 L22 88 M64 22 L78 88" },
  cropped_blazer: { body: P.croppedBlazer, detail: "M44 12 L38 30 L45 35 L50 56 L55 35 L62 30 L56 12 M50 56 V74 M8 70 L17 73 M92 70 L83 73", dots: "M53 64 h.1" },
  blazer_dress: { body: P.blazerDress, detail: "M44 4 L38 22 L45 27 L50 48 L55 27 L62 22 L56 4 M50 48 L60 94 M24 52 H76", dots: "M54 58 h.1 M56 70 h.1" },
  slip_dress: { body: P.slipDress, detail: "M44 27 Q50 34 56 27 M39 41 Q50 45 61 41 M52 45 L58 94" },
  flats: { body: P.flats, detail: "M10 70 H92 M38 52 Q52 64 70 57", dots: "M71 58 h.1" },
  block_heels: { body: P.blockHeels, detail: "M30 68 Q46 70 60 74 M12 62 H28" },
  ankle_boots: { body: P.ankleBoots, detail: "M22 18 H54 M36 70 Q48 70 60 74 M18 66 H34 M46 14 V44" },
  tote: { body: P.tote, detail: "M32 34 Q32 10 50 10 Q68 10 68 34 M38 34 Q38 18 50 18 Q62 18 62 34 M18 46 H82" },
} as const satisfies Record<string, GarmentShape>;
