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

/** Display text style (Bricolage 800, tight tracking / leading) at a size. */
export function displayStyle(size: number, color: string) {
  return { fontFamily: fontFamily.display, fontSize: size, color, letterSpacing: display.letterSpacing * size, lineHeight: Math.round(size * display.lineHeight * 1.08) };
}
