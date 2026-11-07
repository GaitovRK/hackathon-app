# Flick design style ("Reference Direction")

Source of truth: `docs/design/flick-board.html` (board E, decision #2). Every value below lives in `mobile/src/theme/tokens.ts`; components never hard-code hex. Light theme only (`app.json` `userInterfaceStyle: light`). Feel: gallery-white, calm, decisive: the clothes are the color.

## Tokens
| token | value | used for |
|---|---|---|
| paper (`background`, `surface`) | `#FFFFFF` | screens, outfit canvas, cards |
| mist (`surfaceAlt`, `tile`) | `#F5F5F5` | tiles, chips, secondary buttons, icon buttons, setup card |
| chip | `#EBEBEB` | disabled buttons, progress tracks |
| line (`borderSoft`) | `#E5E5E5` | hairlines, card edges, tab bar top |
| ink (`foreground`, `accent`, `border`) | `#141414` | text, primary pill, selected outline, the + |
| ink2 (`muted`) | `#6B6B6B` | secondary text |
| ink3 | `#A3A3A3` | inactive tabs, done / locked rows |
| volt (`accentSoft`) | `#D4FF2A` | **Pro and upsell only**: Try Pro pill, PRO badge, Pro banner |
| lilac (`like`) | `#C9B6FB` | liked, AI, current step, selected chip |
| lilac2 | `#EFE9FE` | soft lilac fill |
| radius | tag 6, small 12, tile 16, card 24, pill 999 | every button and chip is a pill |
| spacing | 4 / 8 / 12 / 16 / 20 (gutter) / 24 / 32 | |

The old role names (`accent`, `accentSoft`, `border`, `block.*`, ...) are kept as aliases so older code compiles; new code uses the board names.

## Type
- **Instrument Serif** 400 (`fontFamily.display`, `displayStyle()`): screen titles 34-40, big numbers (23 / 50), the wordmark. Italic (`fontFamily.displayItalic`, `reasonStyle()`) for the outfit reason line. **Once per screen.**
- **Figtree** (`fontFamily.body` 500, `bodySemibold` 600, `bodyBold` 700): body 14-16, labels 13 / 600, buttons and headings 700.
- Loaded with `@expo-google-fonts/instrument-serif` + `@expo-google-fonts/figtree` (`useAppFonts()`), system fallback until ready.

## Components (`mobile/src/components/`)
- **Buttons**: `ButtonPrimary` ink pill 52h (`small` 40h), `ButtonSecondary` mist, `ButtonVolt` volt (Pro / upsell), `ButtonGhost` text only; pressed = scale .97, disabled = chip bg + ink3. `IconButton` 44 circle: mist / line / ink / lilac.
- **Chips**: `Chip` mist pill 36h, no border; selected = lilac. `variant="tag"` = 26h, radius 8 (selected = ink).
- **Items**: `ItemTile` = flat cutout on a mist tile (radius 16); pickable tiles show a hollow ink3 ring, picked = filled ink check + 2px ink outline. `GarmentCutout` draws the flat SVG (tinted body, faint edge, seam lines; no sticker cut, tilt or shadow). Garment paths: `Items/garmentShapes.ts` (+ `garmentPaths.women.ts`).
- **Outfit**: `OutfitFlatLay` = the layered flat-lay in a 0.68 box: top (outer layer as the **left half**, base as the **right half**), bottom, belt, shoes, accessory; dress replaces top + bottom. `ghost` = grey Pro silhouettes. No image generation.
- **Cards**: `OutfitCard` = white card, 1px line (liked = 2px ink + lilac heart), "01 · Work" pill, heart badge, the italic reason under the card, Wear today / not for me / save. `LookCard` = onboarding card with the only soft shadow in the app.
- **Status**: `SegmentedProgress` (ink done, lilac current, chip todo), `ProgressBar` (5h chip track, ink fill), `ItemMeter` (serif 23 / 50 + bar), `BannerVolt` (volt block + small ink button), `SetupChecklist` (2/4 ring + next step on mist), `StatusMessage`.
- **Navigation**: `TabBar` = paper bar with a hairline, Today and Closet (inactive ink3, active ink + dot) around a raised 60pt ink **+** with a 6pt paper ring (opens the add-items entry: the basics picker in add mode for now). Settings opens from the Today header.
- **Icons**: `Icons/Icon` = the board's 24-grid outline set (1.8 stroke, round caps; filled only when active).

## Rules
- Flat surfaces: no borders except 1px hairlines and the 2px ink selected outline; no hard shadows, gradients or blur.
- Volt marks every Pro moment and nothing else. Lilac marks liked / AI / current step.
- **No custom paywall screen.** Every paywall moment (402 codes, first wow, Try Pro) calls `presentPaywall()` in `services/purchases/presentPaywall.ts`, which presents the RevenueCat dashboard paywall (RevenueCatUI). Restore Purchases stays in Settings.
- Screens: onboarding swipe = back / "7 / 20" / Skip + segmented bar + serif question + card + X / heart; basics picker = "What's already in your closet?", 3 columns, filter chips, sticky "Build my outfits · N"; Today = wordmark + Try Pro, Work-first chips, peeking carousel of 3 with reasons, New set + free count, setup checklist. Closet layout is not part of this board yet (tokens only).
