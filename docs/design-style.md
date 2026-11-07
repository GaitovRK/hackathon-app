# Flick design style ("Color Block")

Source of truth: `docs/design/flick-board.html` (design D). Every value below lives in `mobile/src/theme/tokens.ts`; components never hard-code hex. Light theme only (`app.json` `userInterfaceStyle: light`).

## Tokens
| token | value | used for |
|---|---|---|
| screen / background | `#F6F6F3` | page background |
| surface | `#FFFFFF` | cards, chips, tiles |
| soft | `#ECEDF0` | quiet fills |
| ink / foreground | `#15171C` | text, chunky borders, hard shadows (`--edge`) |
| ink-2 / muted | `#5C606B` | secondary text |
| line / borderSoft | `rgba(21,23,28,.12)` | dividers, unselected tiles |
| accent | `#2E54E8` (on `#FFFFFF`) | primary button, current progress segment |
| pop / accentSoft | `#FFD23F` | highlights, selected tiles, active tab, "pop" button |
| coral | `#FF6A4D` | danger / dislike |
| blocks | camel `#F2B35E`, navy `#22336B`, cobalt `#3D63F0`, sky `#A9C4FF`, blush `#FFC2B0`, butter `#FFD23F`, sage `#A8D5B0` | color-blocked backgrounds derived from the outfit's own garment colors (`blockPalette`) |
| radius | btn 16, tile 18, card 26, pill 999 | |
| spacing | 4 / 8 / 12 / 16 / 24 / 40 | |

## Type
- Display: **Bricolage Grotesque 800**, letter-spacing −0.025em, line-height 0.95 (`displayStyle()` in `useTheme.ts`).
- Body: **Figtree** 400 / 600 / 800 (`fontFamily.body`, `bodySemibold`, `bodyBold`).
- Scale: 11.5 / 14 / 15 / 17 / 22 / 32 / 44.
- Loaded with `@expo-google-fonts/*` + `expo-font` (`useAppFonts()`), system fallback until ready.

## Rules
- **Flat color blocks**, never gradients. A card sits on blocks of its own colors (`ColorBlocks`).
- **Die-cut stickers** (`GarmentSticker`): silhouette drawn as hard offset shadow (3 units, `rgba(0,0,0,.22)`), white cut stroke (7; 9 on picker tiles), tinted body with a 1px `rgba(0,0,0,.16)` edge, then seam lines 1.6 and button dots 3 (`rgba(0,0,0,.28)`, or `rgba(255,255,255,.35)` on dark garments). Each sticker has a deterministic tilt within ±8°.
- **Chunky buttons**: 58px face, 2.5px ink border, radius 16, a 5px ink block under it as the shadow; pressing drops the face by 4px. Variants: primary (accent), alt (surface), pop (butter).
- **Chips**: 36px, 2px ink border, pill; selected = ink fill, screen text.
- **Cards**: 2.5px ink border, radius 26, 6px hard shadow. Tiles: radius 18, 2.5px `line` border; selected = ink border + 4px shadow + butter fill.
- Garment paths: `mobile/src/components/Items/garmentShapes.ts` (board `#p-*` + `.dt` details; skirt / boots / heels / scarf / bag derived in the same style).
- Screens: starter picker headline "What's already in your closet?"; Today = a stack of 3 cards flicked horizontally, the front card on its own blocks; Closet = "23 / 50" meter + category grid; onboarding deck = segmented "7 / 20" bar.
