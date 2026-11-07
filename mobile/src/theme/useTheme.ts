import { block, blockPalette, darkGarmentColors, display, fontFamily, fontSize, fontWeight, garmentPalette, palettes, radius, spacing, type Colors } from "./tokens";

export type Theme = {
  scheme: "light";
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  fontFamily: typeof fontFamily;
  display: typeof display;
  block: typeof block;
  garment: typeof garmentPalette;
  darkGarments: typeof darkGarmentColors;
  blocks: typeof blockPalette;
};

const theme: Theme = {
  scheme: "light",
  colors: palettes.light,
  spacing,
  radius,
  fontSize,
  fontWeight,
  fontFamily,
  display,
  block,
  garment: garmentPalette,
  darkGarments: darkGarmentColors,
  blocks: blockPalette,
};

/** Light-only tokens (app.json `userInterfaceStyle: light`). A hook so a future theme switch is a one-line change. */
export function useTheme(): Theme {
  return theme;
}

/** Serif display text (Instrument Serif) at a size: screen titles, big numbers. Use once per screen. */
export function displayStyle(size: number, color: string) {
  return { fontFamily: fontFamily.display, fontSize: size, color, letterSpacing: display.letterSpacing * size, lineHeight: Math.round(size * 1.05) };
}

/** Italic serif reason line (board 24 italic quote). */
export function reasonStyle(size: number, color: string) {
  return { fontFamily: fontFamily.displayItalic, fontSize: size, color, lineHeight: Math.round(size * 1.2) };
}
