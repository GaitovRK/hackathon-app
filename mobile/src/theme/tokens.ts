/**
 * Design tokens for "Flick" (Color Block system, light theme only), taken from `docs/design/flick-board.html`.
 * The board values live only here: colors, type scale, radius, spacing, fonts, sticker + chunky-button
 * geometry, garment palette and block palette. Components read tokens through `useTheme()`; never
 * hard-code hex values in components. Rules summary: `docs/design-style.md`.
 */
const light = {
  /** --screen */
  background: "#F6F6F3",
  /** --surface */
  surface: "#FFFFFF",
  /** --soft */
  surfaceAlt: "#ECEDF0",
  /** --ink */
  foreground: "#15171C",
  /** --ink-2 */
  muted: "#5C606B",
  /** --edge: every chunky border and hard shadow */
  border: "#15171C",
  /** --line: quiet dividers and unselected tile borders */
  borderSoft: "rgba(21,23,28,0.12)",
  /** --accent */
  accent: "#2E54E8",
  accentForeground: "#FFFFFF",
  /** --pop */
  accentSoft: "#FFD23F",
  /** --coral */
  coral: "#FF6A4D",
  /** --on-block */
  onBlock: "#15171C",
  /** Board blocks, used when an outfit has fewer colors than blocks. */
  blockA: "#FFD23F",
  blockB: "#A9C4FF",
  blockC: "#FFC2B0",
  blockD: "#A8D5B0",
  danger: "#FF6A4D",
  success: "#2E54E8",
  warning: "#F2B35E",
  like: "#2E54E8",
  dislike: "#FF6A4D",
  /** Die-cut sticker: white cut stroke, hard offset shadow, body + detail strokes. */
  sticker: "#FFFFFF",
  stickerShadow: "rgba(0,0,0,0.22)",
  stickerBodyStroke: "rgba(0,0,0,0.16)",
  stickerDetail: "rgba(0,0,0,0.28)",
  stickerDetailLight: "rgba(255,255,255,0.35)",
  tile: "#FFFFFF",
  tileStroke: "rgba(0,0,0,0.16)",
};

export type Colors = typeof light;
export const palettes = { light } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 40 } as const;
/** --r-btn 16, --r-tile 18, --r-card 26 */
export const radius = { sm: 6, md: 10, btn: 16, tile: 18, card: 26, full: 999 } as const;
export const fontSize = { xs: 11.5, sm: 14, md: 15, lg: 17, xl: 22, xxl: 32, display: 44 } as const;
export const fontWeight = { regular: "400", medium: "500", semibold: "600", bold: "700", black: "800" } as const;
/** Display text: Bricolage 800, tight tracking and leading (board `.d`). */
export const display = { letterSpacing: -0.025, lineHeight: 0.95 } as const;

/** Font families loaded by `useAppFonts()` (expo-google-fonts); names match `@expo-google-fonts/*` exports. */
export const fontFamily = {
  display: "BricolageGrotesque_800ExtraBold",
  body: "Figtree_400Regular",
  bodySemibold: "Figtree_600SemiBold",
  bodyBold: "Figtree_800ExtraBold",
} as const;

/** Geometry of the Color Block system (board `.btn`, `.chip`, `.cc`, `.tile`, `.st`). */
export const block = {
  buttonHeight: 58,
  buttonBorder: 2.5,
  buttonShadowOffset: 5,
  chipHeight: 36,
  chipBorder: 2,
  cardBorder: 2.5,
  cardShadowOffset: 6,
  tileBorder: 2.5,
  tileShadowOffset: 4,
  /** Sticker cut (white) stroke in viewBox units: 7 in flat-lays, 9 on picker tiles. */
  stickerStroke: 7,
  stickerStrokeTile: 9,
  stickerBodyStroke: 1,
  stickerDetailStroke: 1.6,
  stickerDotStroke: 3,
  /** Hard shadow offset in viewBox units (board: drop-shadow 0 3px 0). */
  stickerShadowOffset: 3,
  /** Max sticker tilt in degrees (each garment gets a deterministic angle within ±this). */
  stickerTilt: 8,
} as const;

/** Garment colors: the server `Color` enum rendered as a sticker body (board sticker fills). */
export const garmentPalette = {
  white: "#F7F6F2",
  black: "#1F2024",
  grey: "#A3A8AF",
  navy: "#22325E",
  beige: "#E3D2B2",
  camel: "#C8904F",
  brown: "#6E4124",
  olive: "#5F6B4E",
  blue: "#5079BA",
  light_blue: "#BCD0EA",
  red: "#D7433A",
  burgundy: "#7A2A3A",
  pink: "#F0A9C0",
  green: "#3F8A5B",
  yellow: "#F2CF4A",
  orange: "#F08A3C",
  purple: "#7554A8",
  cream: "#F1E9D6",
} as const;

export type GarmentColor = keyof typeof garmentPalette;

/** Which garment colors are dark enough to need the light detail stroke (board `--d`). */
export const darkGarmentColors: ReadonlySet<GarmentColor> = new Set<GarmentColor>(["black", "navy", "brown", "olive", "blue", "burgundy", "purple", "green"]);

/** Board blocks (--camel --navy --cobalt --sky --blush --butter --sage) keyed by the garment colors they stand in for. */
export const blockPalette: Record<GarmentColor, string> = {
  white: "#A9C4FF",
  cream: "#FFD23F",
  beige: "#F2B35E",
  camel: "#F2B35E",
  brown: "#F2B35E",
  yellow: "#FFD23F",
  black: "#FF6A4D",
  grey: "#A8D5B0",
  navy: "#A9C4FF",
  blue: "#3D63F0",
  light_blue: "#A9C4FF",
  red: "#FFC2B0",
  burgundy: "#FFC2B0",
  pink: "#FFC2B0",
  orange: "#FF6A4D",
  green: "#A8D5B0",
  olive: "#A8D5B0",
  purple: "#A9C4FF",
};
