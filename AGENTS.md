# Hackathon App: agent guide

**Event:** "From Zero to First Dollar" AI mobile-app hackathon (RevenueCat, fal, Third Room, Neon Apps; Istanbul App Week), Sat 2026-11-07. Judged on the build, creativity and monetization (RevenueCat subscriptions / paywall / IAP). fal credit: $50.
**Concept:** TBD after the 16:10 reveal (filled by the `kickoff` skill). Until then: generic "prompt → fal image" app with a free daily quota and a `pro` subscription.

## Timeline (Istanbul, UTC+3) and timeboxes
| time | what |
|---|---|
| 16:10 | theme reveal → owner runs `kickoff` (ideas → pick → issues), ≤ 20 min |
| 16:30–19:00 | build: `sprint` rounds (each issue ≤ 30 min of agent work) |
| 19:00 | **feature freeze**: only bug fixes and demo polish after this |
| 19:00–19:20 | demo polish + `pitch` skill (script, Q&A, checklist) |
| 19:30 | **submission** |
| after | 2-min pitch + 1-min Q&A |

## Commands (pnpm only)
```bash
pnpm --dir server install && pnpm --dir mobile install
pnpm verify:server          # server: typecheck + lint + jest + e2e (needs local Postgres)
pnpm verify:mobile          # app: typecheck + lint + jest
pnpm verify                 # both
pnpm --dir server start:dev # API on PORT (default 3000)
pnpm --dir mobile start     # Metro; open the dev client (RevenueCat needs a dev build, not Expo Go)
```
Root is not a pnpm workspace: `server/` and `mobile/` each have their own lockfile.

## Folder map
- `server/` NestJS: `src/auth/` (anonymous JWT, global guard, `@Public()`), `src/fal/` (`models.ts` allowlist + queue client), `src/generations/`, `src/billing/` (RevenueCat entitlement + quota), `src/config/` (zod env), `prisma/` schema + migrations, `test/` Supertest e2e
- `mobile/` Expo SDK 57: `src/app/` Expo Router screens · `src/components/<Group>/` (Buttons, Cards, Layout, Status) · `src/hooks/<domain>/` · `src/services/<domain>/` (api, session, purchases) · `src/store/` RTK Query + slices · `src/theme/` tokens · `src/dev/` dev previews · `messages/en.json` copy · `.maestro/` flows
- `.claude/agents/` roles · `.claude/skills/` skills · `ops/routines.md` cloud routines · `.github/` CI + issue templates

## Hard rules (every agent)
1. **Drafts only.** Create issues, comments, branches and PRs. Never merge, deploy, submit to a store, change RevenueCat / App Store / Vercel / Neon settings or spend money.
2. **No real fal or RevenueCat calls** in tests, scripts or agent runs: mock `@fal-ai/client` and `fetch`. Only the owner, running the app, spends fal credit. The fal key lives only in the server env; never in the app, logs or responses.
3. **Monetization** is judged: every feature should make the paywall moment clearer (what's free, what's `pro`, why pay now). Limits: App Store Review Guideline 3.1.1 (digital features via IAP / RevenueCat only, no external payment links) and 3.1.2 (clear subscription terms, price and period on the paywall, Restore Purchases reachable).
4. **User data ownership:** every server route checks the JWT user owns the row (404 otherwise); zod at every boundary; never log tokens, keys or signed URLs.
5. **Migrations additive only** (new tables, nullable/defaulted columns), generated with `pnpm prisma migrate dev --name <name>`, never hand-written; PR gets the `migration` label. Anything destructive → comment the plan, `status:blocked`.
6. Never commit to `main`. Branch `<type>/<issue>-<desc>`, one worktree per issue (`../hackathon-app-worktrees/<issue>-<desc>`), PR body ends `Closes #<issue>`. Verify scripts green before every commit. Never rebase or force-push.
7. **Open issues only.** Re-fetch an issue right before working on it; closed or no longer routed to you → stop.
8. **Timeboxes win.** After 19:00 no new features; after 19:20 only the owner touches the build.
9. **"How to see it"** on every PR: mobile → the dev preview entry + `pnpm --dir mobile start`; server → curl steps.
10. Never run simulators/emulators, EAS builds or submits. Write Maestro flows, don't run them.

## Decisions (shared memory)
Pinned issue **#2 "Decisions"** lists every product/design decision made with the owner. Every agent reads its body at the start of a run (`gh api repos/GaitovRK/hackathon-app/issues/2 --jq .body`). Never build against a decision; re-raise one only with new info. When a discussion ends in a decision, append one line (what, short why, link, time) via `gh api -X PATCH repos/GaitovRK/hackathon-app/issues/2 -f body=...` keeping the existing text.

## Brief
Pinned issue **#3 "Brief"**: the manager's status brief (skill `status-brief`), body = latest, comments = history.

## Handoff
| label | owner | creates |
|---|---|---|
| `agent:manager` | manager | routing + status brief on #3 (on demand / each sprint) |
| `agent:product` | product | ideas (kickoff) and dev-ready specs → `agent:dev` / `agent:design` |
| `agent:design` | designer | `## Design` section → `agent:dev` |
| `agent:dev` | developer | PRs (`complex` → Fable) |
| `agent:qa` | qa | one review comment per PR |

Extra labels: `mobile` / `server` (where it lands), `migration` (rule 5), `complex` (several systems → Fable developer), `bug`, `reference` (#2, #3: never route or close).
**Priority:** the owner sets `priority:1-p0` / `priority:2-p1` / `priority:3-p2`; agents never change them, work the lowest rank first and skip issues without one (kickoff only *proposes* priorities and applies them after the owner confirms).
**Status:** `status:todo` → `status:in-progress` → `status:review` (PR open); `status:blocked` + a comment why. Keep exactly one `status:*` label: delete the old (`gh api -X DELETE repos/GaitovRK/hackathon-app/issues/<n>/labels/<old>`), add the new (`gh api repos/GaitovRK/hackathon-app/issues/<n>/labels -f 'labels[]=<new>'`).
**Owner commands:** an owner comment with a line starting `/product`, `/design`, `/dev`, `/manager` or `/qa` triggers that agent on the issue/PR (skill `handle-command`). Owner comments are suggestions to discuss; the agent replies whether it agrees and changes things only if it does or the owner says "implement". Agents never start a line with a slash command.
**GitHub in cloud runs:** GraphQL may be blocked, so `gh issue/pr` subcommands can fail. Use `gh api repos/GaitovRK/hackathon-app/...` (REST) or the GitHub MCP tools.
Templates in `.github/ISSUE_TEMPLATE/`; agents `.claude/agents/`; skills `.claude/skills/` (`kickoff`, `sprint`, `pitch`, `coding-conventions`, `design-spec`, `handle-command`, `status-brief`); routines `ops/routines.md`.
