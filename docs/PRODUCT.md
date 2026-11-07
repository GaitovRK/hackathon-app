# Product: AI closet ("what to wear today")

**Promise:** "Stop staring at your closet. Today's outfit is ready in 10 seconds."

**Job:** the user adds photos of their own clothes, the app turns them into a tagged digital closet, and every morning it suggests 3 complete outfits as flat-lay collages, chosen the way the user would pick.

**First users:** busy professionals (any gender) asking "what do I wear to work?". English only, iOS first, Android kept possible.

**Key metric:** time-to-first-outfit. A new user sees 3 outfits within 60 s, with zero photos (starter closet).

## v1 scope (this hackathon)
1. **Onboarding (≤ 60 s):** welcome + privacy line → swipe ~20 curated looks (like / dislike) → 3 questions (dress code, city, wardrobe) → starter closet picker (tap the basics you own) → "Build my outfits".
2. **Today tab:** occasion chips (work default) → 3 distinct outfits as flat-lay grids of item tiles + a one-line reason. Actions: worn today, save, 👍 / 👎, refresh.
3. **Closet tab:** item grid by category, tap → tag edit sheet. Items come from the starter catalog now; photo import later.
4. **Outfit engine (server, rules first):** slot templates (top + bottom + shoes [+ outerwear] [+ accessory], or dress + shoes [+ outerwear]), filtered by occasion / dress-code formality / season, scored by color harmony, style-profile fit (dress code + liked looks) and wear history (no repeats from yesterday, rotate under-worn items). A `ReasonProvider` seam lets an LLM re-ranker plug in later.
5. **Settings:** restore purchases, user id.

## Freemium
| | Free | Pro |
|---|---|---|
| Closet items | up to 50 (`FREE_ITEM_LIMIT`) | unlimited |
| Today's 3 outfits | yes | yes |
| Saving outfits | yes | yes |
| Refresh (regenerate) | 1 / day (`FREE_REFRESH_LIMIT`) | unlimited |
| Mirror-selfie auto-scan | – | yes |
| Weather-aware outfits | – | yes |
| Outfit score | – | yes |

- **Prices** live in RevenueCat (offering `default`, entitlement `pro`): $4.99 / month or $29.99 / year with a 7-day trial on the annual plan.
- **Limits** live in server config (`server/src/config/env.ts`); the server decides, the app only reacts to `402` (`ITEM_LIMIT`, `QUOTA_EXCEEDED`).
- **Paywall moments:** once right after the first outfits are shown (the "first wow"), on `ITEM_LIMIT`, on the refresh limit. Never before value.

## Non-goals (v1)
Virtual try-on, shopping links, packing lists, declutter, social, Android release, localization.

## Later (not in #5)
Photo import + Claude Haiku vision tagging + fal cutouts + approve queue; mirror-selfie scan; LLM re-rank with reasons; Skia flat-lay + 9:16 / 2:3 share export with watermark; weather (Open-Meteo); PostHog events; Apple / Google sign-in; account deletion.

## Glossary
- **Item:** one garment in the closet (`starter` from the catalog or `photo` from an import). Tagged with category, subcategory, colors, pattern, material, formality 1–5, warmth 1–5, seasons, occasions.
- **Starter catalog / starter item:** ~30 generic basics (white oxford shirt, navy chinos…) with full tags and a `starterKey`, so a user has a closet before taking a photo.
- **Look:** a curated set of starter items shown during onboarding; a swipe (like / dislike) feeds the style profile.
- **Style profile:** dress code, city, wardrobe + the swipes; 1:1 with the user.
- **Outfit:** a scored combination of items for a date + occasion, built from a **template** (slot layout). Status `suggested` → `saved` / `worn`.
- **Slot:** a role inside a template (top, bottom, dress, outerwear, shoes, accessory).
- **Wear:** the record that an outfit was worn on a date; drives repetition and rotation rules.
- **Occasion:** `work | friends | date | event | casual | sport | travel`.
- **Dress code:** `formal | smart_casual | casual | creative`; maps to a formality range.
- **Flat-lay:** the outfit rendered as a grid of item tiles (SVG silhouettes now, Skia collage later).
