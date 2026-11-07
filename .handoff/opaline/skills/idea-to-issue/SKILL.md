---
name: idea-to-issue
description: Turn owner notes, marketing findings, research and data into vetted feature issues with acceptance criteria, using proven AI-photo-app growth and monetization patterns. Use in product runs.
---
## What makes sellers stay and pay
- **Time to first great photo** is the activation lever: fewer steps from signup to a usable on-model image (example outputs, sensible defaults, upload from phone camera roll, progress while waiting).
- **Quality and trust**: fewer failed, rejected or regenerated images; outputs that look like a real catalogue (garment true to the photo, no warped hands/hems). Measure with failed / regenerate / rejected rates.
- **Workflow fit**: sellers shoot a whole collection at once and post to Instagram / Trendyol / ikas — batch flows, consistent model across a collection, export sizes and downloads that fit those channels.
- **Habit**: new collections arrive weekly or seasonally; reasons to come back (saved models/sets, "new poses/models" drops, reminders tied to their own uploads). Honest, opt-in nudges only.

## Monetization (copy what works, stay compliant)
- Default to patterns proven in top AI photo / creator apps (Photoroom, Higgsfield, Lensa, Remini, Botika, Pebblely): paywall after free credits, trials, annual plans, plan upsells when the balance runs low, credit packs, limited-time and first-purchase offers, referral credits, watermark removal as a paid perk. Cite the app that uses it.
- Judge ideas by paid conversion, revenue per user and week-2 retention, not by whether they push the user to pay. Keep the per-image margin (README "Pricing"; fal ≈ $0.05/image).
- Hard limits only (App Store Review Guidelines + consumer law): IAP for digital credits on iOS (3.1.1), real prices and real "was" prices, countdowns that really end, clear subscription terms (3.1.2), Restore Purchases, no misleading claims about outputs.

## Steps (weekly run: new ideas)
0. Read the Decisions issue #95; drop any idea that contradicts it.
1. Read open issues, the latest "Weekly analytics" issue and analytics proposals.
2. Read the marketing system (CLAUDE.md "Marketing link"): the newest `data/trends/*-opaline.md` and `*-ai-video.md` (esp. `## Act on this`, `## Questions people ask`, `## Product ideas`, `## Tools and models`), `data/competitors/opaline/*`, the newest `plans/*.md` (Opaline goals) and `data/metrics/*-opaline.md`. Web-search 2–3 competitor apps for patterns.
3. Draft up to 8 ideas, one paragraph each, with the mechanism (activation, quality, workflow, habit, monetization) and evidence (link marketing files by path).
4. Run the `critic` subagent on them; keep 3–5 that pass.
5. Skip anything that duplicates an open issue (`gh api 'search/issues?q=repo:GaitovRK/outfit-studio+is:open+<words>'`).
6. Create each with the feature template (REST): `gh api repos/GaitovRK/outfit-studio/issues -f title="<idea>" -F body=@body.md -f 'labels[]=agent:dev' -f 'labels[]=status:todo'` (`agent:design` instead of `agent:dev` if it touches UI; add `web`/`mobile`). Body: Problem / Idea / Platform / Evidence / Critic verdict / Acceptance criteria (checkboxes) / Metric to measure it.

## Refining an existing issue (do this first, every run)
Open `agent:product` + `status:todo` issues are rough notes (the owner's, or `from:marketing` ones filed by the marketing weekly review), not specs. For each:
1. Read it and its comments (the owner's comments are suggestions: weigh them honestly and reply whether they work; apply them when they do or when the owner says to implement); find related issues, code (`src/`, `mobile/src/`), README "Credits" and any marketing file it links.
2. Decide the seller problem and the mechanism; run the `critic` on it. The hard limits above still apply — if the note breaks one, propose the closest compliant version and say so. Not product work (needs accounts, App Store / RevenueCat setup, pose photos) → remove `agent:*`, comment that it's an owner task.
3. Design (short note; the designer writes the full `## Design` section for UI issues): web and/or iOS, which screen, which existing components (`src/components/<Group>/`, `mobile/src/components/<Group>/`), house style (`docs/design-style.md`), EN + TR copy, motion notes.
4. Rewrite the body (`gh api -X PATCH repos/GaitovRK/outfit-studio/issues/<n> -F body=@body.md`) as: Problem / Proposal / Platform / Design / Evidence / Critic verdict / Acceptance criteria (checkboxes) / Metric / Schema change (none, or additive: what) / Out of scope, then `---` and "Original note:" with the original text unchanged.
5. Relabel: remove `agent:product`, add `agent:dev` + `status:todo` (+ `complex` if it spans several systems, + `web`/`mobile`). **Touches UI** (a screen, sheet, dialog, paywall or button) → `agent:design` instead of `agent:dev`; the designer hands it on. Comment one line summarizing what changed.
6. Not workable (needs an owner decision) → ask the question in a comment, set `status:blocked`, keep `agent:product`.
