/**
 * Design tokens for "Flick" (Reference Direction board, light theme only), taken from
 * `docs/design/flick-board.html`. Gallery-white screens, mist tiles, ink pills, one volt accent for every
 * Pro / upsell moment and lilac for liked / AI / current step. Components read tokens through
 * `useTheme()`; never hard-code hex values in components. Rules summary: `docs/design-style.md`.
 *
 * The older role names (accent, accentSoft, border, ...) are kept as aliases so existing components keep
 * compiling; new code should prefer the board names (paper, mist, ink, volt, lilac, ...).
 */
const board = {
  paper: "#FFFFFF",
  mist: "#F5F5F5",
  chip: "#EBEBEB",
  line: "#E5E5E5",
  ink: "#141414",
  ink2: "#6B6B6B",
  ink3: "#A3A3A3",
  volt: "#D4FF2A",
  lilac: "#C9B6FB",
  lilac2: "#EFE9FE",
} as const;

const light = {
  ...board,
  /** Screens and the outfit canvas. */
  background: board.paper,
  surface: board.paper,
  /** Tiles, chips, secondary buttons, the tab tray. */
  surfaceAlt: board.mist,
  foreground: board.ink,
  muted: board.ink2,
  /** Selected outline (2px ink). */
  border: board.ink,
  /** Hairlines and card edges. */
  borderSoft: board.line,
  /** Primary action: the ink pill. */
  accent: board.ink,
  accentForeground: board.paper,
  /** Pro / upsell highlight (volt). */
  accentSoft: board.volt,
  coral: "#E5484D",
  onBlock: board.ink,
  blockA: board.mist,
  blockB: board.mist,
  blockC: board.mist,
  blockD: board.mist,
  danger: "#D92D20",
  success: board.ink,
  warning: "#B54708",
  like: board.lilac,
  dislike: board.ink2,
  /** Garment cutout strokes (flat cutouts on a mist tile, no die-cut sticker any more). */
  sticker: "transparent",
  stickerShadow: "transparent",
  stickerBodyStroke: "rgba(0,0,0,0.10)",
  stickerDetail: "rgba(0,0,0,0.24)",
  stickerDetailLight: "rgba(255,255,255,0.2)",
  tile: board.mist,
  tileStroke: board.line,
  /** Locked / ghost garment fill (Pro silhouettes). */
  ghost: "#ECECEE",
};

export type Colors = typeof light;
export const palettes = { light } as const;

/** 4-pt scale; 20 is the side gutter. */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, gutter: 20, xl: 24, xxl: 32 } as const;
/** 6 tag · 12 small tile · 16 tile · 24 card · pill for every button and chip. */
export const radius = { sm: 6, md: 12, btn: 999, tile: 16, card: 24, full: 999 } as const;
/** Figtree body 14-16, labels 13, headings 21; serif titles 34-40, reasons 24. */
export const fontSize = { xs: 12, sm: 13, md: 15, lg: 16, xl: 21, xxl: 36, display: 40, reason: 24 } as const;
export const fontWeight = { regular: "400", medium: "500", semibold: "600", bold: "700", black: "800" } as const;
/** Serif display text (Instrument Serif 400): slightly tight tracking, tight leading. */
export const display = { letterSpacing: -0.01, lineHeight: 1.0 } as const;

/** Font families loaded by `useAppFonts()` (expo-google-fonts); names match `@expo-google-fonts/*` exports. */
export const fontFamily = {
  /** Instrument Serif: screen titles, big numbers. Once per screen. */
  display: "InstrumentSerif_400Regular",
  /** Instrument Serif italic: the reason line. */
  displayItalic: "InstrumentSerif_400Regular_Italic",
  body: "Figtree_500Medium",
  bodySemibold: "Figtree_600SemiBold",
  /** Buttons and headings. */
  bodyBold: "Figtree_700Bold",
} as const;

/** Component geometry (board `.btn`, `.chip`, `.ib`, `.tile`, tab bar). Flat: no borders or shadows except the 2px selected outline. */
export const block = {
  buttonHeight: 52,
  buttonHeightSmall: 40,
  buttonBorder: 0,
  buttonShadowOffset: 0,
  chipHeight: 36,
  chipBorder: 0,
  tagHeight: 26,
  iconButton: 44,
  cardBorder: 1,
  cardShadowOffset: 0,
  tileBorder: 2,
  tileShadowOffset: 0,
  /** Selected outline width (ink). */
  selectedBorder: 2,
  tabBarHeight: 64,
  fab: 60,
  fabRing: 6,
  segmentHeight: 4,
  barHeight: 5,
  /** Cutout strokes in viewBox units. */
  stickerStroke: 0,
  stickerStrokeTile: 0,
  stickerBodyStroke: 1,
  stickerDetailStroke: 1.4,
  stickerDotStroke: 2.6,
  stickerShadowOffset: 0,
  /** Cutouts sit straight, front-facing. */
  stickerTilt: 0,
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
