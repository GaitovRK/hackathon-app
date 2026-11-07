---
name: design-spec
description: Write the detailed Design section of a UI issue from the owner's references (#96 + issue screenshots), Opaline's house style and existing components, for web and iOS. Use in designer runs and /design commands.
---
Use `gh api` REST (GraphQL is blocked in cloud runs, see CLAUDE.md).

## 1. Gather inputs (in this order; earlier wins)
1. **The issue itself:** body, comments, screenshots and notes. Most specific to this screen.
2. **Design references #96:** `gh api repos/GaitovRK/outfit-studio/issues/96 --jq .body` plus all its comments. Each entry is a screenshot + what the owner finds good. Pick the 1–3 entries relevant to this screen and use exactly what the owner praised. They are ideas, not rules: adapt them to Opaline's style, never copy another app's art or layout one to one.
3. **House style:** `docs/design-style.md`, tokens in `src/app/globals.css` and `mobile/src/theme/` (`colors.ts`, `fonts.ts`), components in `src/components/<Group>/` and `mobile/src/components/<Group>/`.
4. **Decisions #95.** Decisions and house-style rules beat references. If a reference conflicts, follow the rule and note the conflict in one line.

No references at all → design from house style only and write "No references given" under References.

**Images:** cloud runs can't open GitHub `user-attachments` links (the image host is blocked). Use the repo copy instead:
- **#96 references:** `docs/references/README.md` lists every entry (tag, Good/Avoid, image file); view the images with Read. It's a mirror the owner refreshes with `python3 scripts/agents/sync_design_refs.py`.
- An entry in #96 that's missing from `docs/references/` → comment asking the owner to run the sync, and use the entries that are there.
- **Issue screenshots:** try `curl -sfL -H "Authorization: token $(gh auth token)" -o <scratchpad>/ref-1.png "<url>"`. If it fails, comment asking the owner to add it to #96 and sync, then `status:blocked`.

Never describe an image you haven't seen.

## 2. Write the `## Design` section (in this order)
1. **Goal & context:** the screen/sheet/dialog, platform(s), entry point, what the seller should feel and do.
2. **References:** each image used (#96 entry or issue screenshot link) → what to take from it.
3. **Layout & hierarchy:** ASCII wireframes top to bottom — iPhone width, and web desktop when the issue covers web; mark the primary action.
4. **Components:** existing ones by path (`src/components/Cards/...`, `mobile/src/components/...`). A new component: name, group folder on both platforms, why no existing one fits.
5. **Tokens:** color names (`surface`, `muted`, `accent`…), type (system sans size / `font-display` for big titles only), radius and spacing names; never raw hex. A missing token → propose one in this section (both `globals.css` and `colors.ts`).
6. **Light & dark:** how it looks in both.
7. **States:** default, pressed/hover, disabled, empty, loading, generating/progress, failed (refund note), out of credits, free user (watermark), first-time vs repeat.
8. **Motion & feedback:** what animates, duration/easing, iOS haptics.
9. **Copy:** exact strings in EN **and** TR, short, seller-focused (TR runs longer: check it fits).
10. **Edge cases:** iPhone SE and Pro Max, safe areas, keyboard, narrow and wide browser windows, long outfit names, 10 outfits × many poses, slow networks.
11. **Design checklist:** 5–8 checkboxes dev and the owner can verify.

## 3. Update the issue
- Replace product's short Design part with the new `## Design` section (`gh api -X PATCH .../issues/<n> -F body=@file`). Keep every other section and the "Original note" at the bottom unchanged.
- Relabel: remove `agent:design` and `status:in-progress`, add `agent:dev` + `status:todo`. Keep `complex`, `web`/`mobile` and `priority:*`.
- One comment: which references were used and the 2–3 key design choices.

## 4. New reusable pattern (optional)
If the design introduces a pattern other screens will reuse (new sheet type, image-state badge, paywall layout), open a separate PR on `docs/<issue>-design-style-<pattern>` that adds it to `docs/design-style.md`, keeping the file's format. Link the issue in the body ("Part of #<n>", not `Closes`). Never edit app code.
