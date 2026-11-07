@AGENTS.md

# Local database

- Local dev never points at the production database (no prod `DATABASE_URL` in `.env`, `.env.local` or `.env.development.local`; `PROD_DATABASE_URL` is only read by `pnpm db:snapshot`).
- Each checkout / worktree uses its own local copy of prod: `pnpm db:snapshot` (once / to refresh, run by the user), then `pnpm db:clone <issue>` in the worktree.
- Tests use `<db>_test` on the local Postgres, never Neon.

# Opaline — agent guide

**Concept:** bulk on-model outfit photos for clothing sellers. Pick an AI model, drop up to 10 outfits (1–3 photos each), and every pose of that model is generated per outfit (fal, 9:16) in the background. Credits pay for images (10 per image, 5 per regenerate, HD free); iOS sells plans and packs via RevenueCat. Web (Next.js, `src/`) + iOS app (Expo, `mobile/`) with the same features. EN + TR (TR is the default locale).
**Audience:** small and mid-size fashion sellers and boutiques (Instagram shops, Trendyol / ikas stores) who need catalogue photos without a shoot. Target look: Zara / H&M / LC Waikiki / Massimo Dutti catalogue shots.

## Glossary
- **Model**: an AI model (`Model`, slug like `camila`) with filters (gender, age, look, body, garment, background). **Pose**: one reference shot of a model (`Pose`, `assets/models/<model>/<nn>-<pose>.jpg`, synced by `pnpm seed`).
- **Batch**: one run = a model + up to 10 **outfits**; each outfit × pose = one **Generation** (an image: `queued → running → done | failed`).
- **Regenerate**: redo one image (5 credits). **HD**: free upscale of a finished image. **Rejected**: an image the user marked bad.
- **Credits**: balance from grants (`signup`, `pack`, `subscription` (expires), `admin`); charged per image up front, refunded when an image fails (`src/lib/credits/`). **Watermark**: added to outputs until the user's first purchase.
- **Activation**: a new user makes a first batch. **Paying user**: bought a pack or subscription.

## Commands (pnpm only)
```bash
pnpm install && pnpm --dir mobile install
pnpm dev                    # web dev server
pnpm verify                 # web: typecheck + lint + vitest (needs Postgres, see "Local database")
pnpm verify:mobile          # iOS app: typecheck + lint + jest
pnpm test:e2e               # Playwright (backend mocked; seeds its users into the local <db>_test for the admin flag)
python3 scripts/agents/sql.py -f scripts/agents/weekly-metrics.sql   # weekly numbers (read-only role, over HTTPS; -c "SELECT …" for ad hoc)
```
Deploys: Vercel deploys `main` to production; every PR gets a preview deployment. iOS builds: Xcode archive → TestFlight (see the global react-native-build rule). **Local sessions run builds and uploads when the owner asks**; scheduled/cloud agents never do.

## Folder map
- `src/app/` Next.js routes (`(studio)`, `api/`, `login`…) · `src/components/<Group>/` web UI by type · `src/hooks/<domain>/` · `src/lib/` server logic (`credits`, `generation`, `fal`, `storage`, `auth`, `watermark`, `appStore`) · `src/store/` RTK Query · `messages/{en,tr}.json` web copy
- `mobile/src/app/` Expo Router screens · `mobile/src/components/<Group>/` · `mobile/src/hooks/` · `mobile/src/services/` · `mobile/src/theme/` tokens · `mobile/messages/` app copy (`mobile/locales/` = iOS permission strings)
- `prisma/` schema + migrations · `assets/models/` pose photos · `e2e/` Playwright · `scripts/` (`scripts/agents/` = agent tooling) · `docs/` design style + references · `ops/` agent routines
- Tests: web `src/**/*.test.ts(x)` (vitest), iOS `mobile/src/**/*.test.ts(x)` (jest), E2E `e2e/*.spec.ts`

## Design rules
- House style: [docs/design-style.md](docs/design-style.md): calm, editorial, photo first; stone neutrals; Cormorant Garamond (`font-display` / `fonts.display`) for big titles only.
- Tokens only: web colors are Tailwind theme tokens from `src/app/globals.css` (`bg-surface`, `text-muted`, `border-border`, `bg-accent`…), iOS `useColors()`, `radius`, `spacing` from `mobile/src/theme/colors.ts`. No raw hex in components. Light and dark mode both.
- Reuse components from `src/components/<Group>/` and `mobile/src/components/<Group>/` before adding new ones; web and iOS look the same.
- Every string in both `en` and `tr` (web `messages/`, iOS `mobile/messages/`); no hard-coded copy.

## Hard rules (every agent)
1. **Drafts only.** Create issues, comments, branches and PRs. Never merge, deploy to production, release, submit for App Review, change App Store / RevenueCat / Vercel / R2 settings, grant credits or spend money (no fal calls, no paid APIs). Exception: when the owner asks in a local session, build and upload to TestFlight.
2. **Early exit.** A scheduled agent first checks for new work; if none, it posts nothing and stops with a one-line note.
3. **Reports go to GitHub** issues/comments — never committed files.
4. **Monetization:** maximize paid conversion, revenue per user and retention with patterns proven in top AI photo / creator apps (Photoroom, Higgsfield, Lensa, Remini, Botika…): paywall after the free credits, plan upsells, credit packs, trials, annual plans, limited-time offers, referral credits. Only limits: App Store Review Guidelines and consumer law: real prices and timers, clear subscription terms (3.1.2), digital credits via IAP on iOS (3.1.1), Restore Purchases, no misleading output claims. Keep the ~50–60% margin per image (README "Pricing"); never sell an image below fal cost.
5. **Deterministic work runs as scripts** (`scripts/agents/weekly-metrics.sql`, PostHog queries, `pnpm credits:show`); agents read the output, never guess numbers.
6. Never commit to `main`. Branch `<type>/<issue>-<desc>`, PR body ends `Closes #<issue>`. CI must be green.
7. **Open issues only.** Right before starting work on an issue, re-fetch it (`gh api repos/GaitovRK/outfit-studio/issues/<n>`). If it is closed, or its labels no longer route it to you, stop: don't branch, relabel or open a PR. Issue lists from earlier in a session (or a brief) are stale. Applies to any issue number another agent hands you too.
8. **"How to see it" on every agent PR.** Web changes: the PR's Vercel preview URL + the page and steps. iOS changes: the floating dev "Preview" button plus preview entries for what changed (`coding-conventions`); it is removed with `bash scripts/agents/remove-dev-preview.sh` before merge.
9. **Migrations are additive only.** Vercel preview builds run `prisma migrate deploy` against the **production** database, so a migration hits prod as soon as its PR builds. Agents may only add tables, or columns that are nullable or have a default (generated with `pnpm prisma migrate dev --name <name>`, never hand-written). Such PRs get the `migration` label. Anything that drops, renames or changes a column or makes one required → comment the plan, set `status:blocked` and ask the owner.
10. **User data and money are sensitive.** Every API route checks the session user owns what it touches; credit charges, refunds and grants stay in `src/lib/credits/` and are idempotent; never log tokens, signed URLs or emails.

## Decisions (shared memory)
The pinned issue **#95 "Decisions"** lists every product/design decision made with the owner. **Every agent reads its body at the start of a run** (`gh api repos/GaitovRK/outfit-studio/issues/95 --jq .body`). Never propose, spec or build against a decision; re-raise one only with new data, and say what's new. When a discussion with the owner ends in a decision, add one line to the end of the body (what, short why, link, date) via `gh api -X PATCH repos/GaitovRK/outfit-studio/issues/95 -f body=...` (keep the existing text) and link it in your reply.

## Design references
The pinned issue **#96 "Design references"** (label `design:references`) is the owner's library of good UI examples: a screenshot + what's good about it, in the body or comments. They are ideas, not rules. Cloud agents can't open GitHub image links, so the owner mirrors #96 into `docs/references/` with `python3 scripts/agents/sync_design_refs.py` (run locally, commit). The designer (`.claude/agents/designer.md`, skill `design-spec`) reads it on every run, together with `docs/design-style.md`; no web research. Agents never route, relabel or close it.

## Marketing link (GaitovRK/marketing-agents)
The marketing system ([marketing-agents](https://github.com/GaitovRK/marketing-agents), app slug `opaline`) researches the market for Opaline. Product and analyst runs read it (cloud runs have it checked out next to this repo; locally `~/Projects/marketing-agents`); never edit it.
- `apps/opaline.md` (positioning, pricing, launch status) and `goals.md` → `## Opaline` (monthly goals and KRs).
- `data/trends/*-opaline.md` (viral formats, competitor moves, questions people ask, `## Act on this`) and `data/trends/*-ai-video.md` (`## Tools and models`, `## Product ideas`).
- `data/competitors/opaline/*.json` (competitor listings) and `data/metrics/*-opaline.md` (weekly numbers).
- `plans/YYYY-Www.md` (this week's goals; `## Product ideas`).
Marketing's weekly review files its Opaline product ideas here as issues labelled `from:marketing` + `agent:product` + `status:todo`, so product refines them like any owner idea. Release notes stay with marketing's `release-pack`.

## Handoff
| label | owner | creates |
|---|---|---|
| `agent:manager` | manager | daily 15:00 triage + brief on the pinned "Daily brief" issue #97 (body = latest, comments = history) |
| `agent:product` | product | refines rough issues into dev-ready specs, new feature issues → `agent:dev` / `agent:design` |
| `agent:design` | designer | `## Design` section for UI issues from #96 references → `agent:dev` |
| `agent:dev` | developer | PRs (`complex` → Fable) |
| `agent:qa` | qa | one review comment per PR (spec, decisions, code; CI runs the tests) |
| `agent:analyst` | data-analyst | weekly report issue, proposals → `agent:product` / `agent:dev` |

Extra labels: `web` / `mobile` (where the change lands), `migration` (rule 9), `from:marketing` (filed by marketing-agents), `complex` (spans several systems → Fable developer).
Priority: the owner sets `priority:<rank>-<name>` labels directly on issues (`priority:1-p0`, `priority:2-p1`, `priority:3-p2`; rank 1 = highest; agents never change them). The project's Priority field is not used. Agents work the lowest rank first and skip issues with no `priority:*` label.
**Owner commands:** a comment by the owner whose line starts with `/product`, `/design`, `/dev`, `/analyst`, `/manager` or `/qa` triggers that agent on that issue/PR right away (skill `handle-command`). Owner comments are **suggestions to discuss**: the agent analyzes them and replies whether they're good to implement and why; it changes things only if it agrees or the owner explicitly says to implement. Agents never start a line with a slash command.
Status: `status:todo` → `status:in-progress` → `status:review` (PR open); `status:blocked` + a comment saying why. **Every agent** (dev, design, product, analyst) sets `status:in-progress` the moment it starts on an issue and `status:review` when its PR, spec or report is ready for the owner. Keep exactly one `status:*` label: remove the old one, add the new one (`gh api -X DELETE .../issues/<n>/labels/<old>`, then `gh api .../issues/<n>/labels -f 'labels[]=<new>'`). `.github/workflows/status-sync.yml` copies each new `status:*` label into the project Status column (todo → Ready, in-progress → In progress, review → In review; blocked has no column and stays a label).
**GitHub access in cloud runs:** GraphQL is blocked, so `gh issue/pr/project` subcommands fail. Use the GitHub MCP tools (`mcp__github__*`) or REST via `gh api repos/GaitovRK/outfit-studio/...`.
Templates in `.github/ISSUE_TEMPLATE/`: feature, bug, analytics-proposal. Agents in `.claude/agents/`, skills in `.claude/skills/`, routines in `ops/routines.md`.
