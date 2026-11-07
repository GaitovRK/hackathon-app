# Routines

Create each routine with `/schedule` in Claude Code or at claude.ai/code/routines.
All routines use the repo **GaitovRK/outfit-studio** and timezone **Europe/Istanbul**. Product and data-analyst also check out **GaitovRK/marketing-agents** (read-only, CLAUDE.md "Marketing link"). Each prompt below is self-contained, so paste it as-is.
Models: `fable` = Claude Fable 5.1 (`claude-fable-5-1`) for the hardest jobs (complex issues, weekly product research); opus for coding (developer), specs and design; sonnet for triage, QA, analytics and the rest.

Every routine needs the **GitHub** connector, which comes from installing the Claude GitHub App on both repos.

**Window:** Opaline runs 15:00–21:00. Block Link (22:00–06:00) and marketing-agents (23:07–05:37) own the night, so nothing here runs after 21:00.

## Cloud environments
**As created (2026-10-23):** seven routines use the shared cloud environment `env_01Qhu4UWYwGATAS8V6f4TDeK` (Default, trusted network, same as Block Link). The data-analyst and commands use `opaline-analyst` (`env_018ttNpYj65afKEyQrXLgb9E`): network Limited (`*.neon.tech` + package managers), env var `METRICS_DB_URL` = the read-only `opaline_analyst_ro` role (column grants, no emails). The sandbox only lets HTTP(S) out, so `psql` (port 5432) times out there; queries go through `scripts/agents/sql.py` (Neon's HTTPS SQL endpoint). All routines run their setup at the start of the prompt (pnpm installs, local Postgres for tests, `psql`). Each has only the `Claude_Code_Remote` connector (the API attaches every account connector, Gmail included, when the list is empty). The setup below was the original target; only `opaline-analyst` was split out.

| Routine | Trigger id |
|---|---|
| opaline-manager | `trig_01Hxd5UsXx4ir4zJs5YA23L1` |
| opaline-product-refine | `trig_01YZrjCmdBxC75q3VxB2Z56G` |
| opaline-designer | `trig_01Dm8tkhn63uZAwY5NfCRF8U` |
| opaline-developer | `trig_01Khwy3zzy3PGQULNRLJv2m5` |
| opaline-developer-complex | `trig_01FX1xpGXssUUShEAsZxUUKj` |
| opaline-data-analyst | `trig_01DBes1f4d2g2gE7ietG5kp7` |
| opaline-product | `trig_01M42aBznfb4DpZpRHwHdG9S` |
| opaline-qa (GitHub `pull_request.opened`, `ready_for_review`) | `trig_01FudmrJ5aHiFrVqR3bEtdWK` |
| opaline-commands (GitHub `issue_comment.created`) | `trig_01AzLmkN2Qx27GebCv5MqDAg` |

Cron expressions are in UTC (Istanbul − 3 h): manager `0 12 * * *`, product-refine `0 13 * * 0-5`, designer `0 14 * * *`, developer `0 15 * * *`, developer-complex `0 16 * * *`, data-analyst `0 12 * * 6`, product `30 13 * * 6`.

**`opaline`** (every routine except the data-analyst). No secrets. Setup script:
```bash
corepack enable
pnpm install --frozen-lockfile && pnpm --dir mobile install --frozen-lockfile
# Postgres for vitest (tests use <db>_test); local to the sandbox, never prod
if ! command -v pg_ctlcluster >/dev/null; then sudo apt-get update -qq && sudo apt-get install -y -qq postgresql; fi
sudo service postgresql start
sudo -u postgres psql -qc "ALTER USER postgres PASSWORD 'postgres'"
sudo -u postgres createdb outfit_studio 2>/dev/null || true
sudo -u postgres createdb outfit_studio_test 2>/dev/null || true
printf 'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/outfit_studio\nAUTH_SECRET=cloud-dev-only\n' > .env
```
**`opaline-analyst`** (data-analyst and commands). Same setup script (it installs `psql` too), plus the env var `METRICS_DB_URL` = a **read-only** Postgres role on the production DB (like marketing-agents' `METRICS_DB_URL_OPALINE`: `GRANT SELECT` only). Kept out of `opaline` so the developer never sees a prod URL.

| Routine | Trigger | Model | Env | Extra connectors / repos |
|---|---|---|---|---|
| opaline-manager | daily 15:00 triage + brief (`0 15 * * *`) | sonnet | opaline | none |
| opaline-product-refine | daily 16:00 except Saturday (`0 16 * * 0-5`) | opus | opaline | marketing-agents repo |
| opaline-designer | daily 17:00 (`0 17 * * *`) | opus | opaline | none |
| opaline-developer | daily 18:00 (`0 18 * * *`) | opus | opaline | none |
| opaline-developer-complex | daily 19:00 (`0 19 * * *`) | fable | opaline | none |
| opaline-data-analyst | Saturdays 15:00 (`0 15 * * 6`) | sonnet | opaline-analyst | marketing-agents repo, PostHog (read-only, once #78 ships) |
| opaline-product | Saturdays 16:30 (`30 16 * * 6`) | fable | opaline | marketing-agents repo, web search |
| opaline-qa | GitHub `pull_request.opened`, `ready_for_review` (not on every push; re-review with a `/qa` comment) | sonnet | opaline | none |
| opaline-commands | GitHub `issue_comment.created` | opus | opaline-analyst | marketing-agents repo, PostHog |

Supporting GitHub Actions (no Claude): `status-sync.yml` on every `status:*` label, `ci.yml` on every PR. `status-sync` needs the repo secret `PROJECT_TOKEN` (classic PAT: `repo`, `project`), the same one Block Link uses.

**On demand:** the owner runs `/sprint` from local Claude Code (`.claude/skills/sprint/SKILL.md`): manager → product (refine only) → designer → developers → QA → one fix round, each as a fresh run of these routines.

**Daily pipeline.** The owner adds ideas to the project in the morning and early afternoon and reviews PRs in the evening. Each day: manager 15:00 (triages the day's ideas) → product-refine 16:00 (specs → `agent:dev`, UI → `agent:design`) → designer 17:00 (`## Design` → `agent:dev`) → developer 18:00 / complex 19:00 → QA on each PR, so PRs are ready for the evening review (QA comments + Vercel previews on each PR). The next day's 15:00 brief lists them. Ideas added after 15:00 are picked up the next day.

**Weekly (Saturday):** analyst 15:00, then product 16:30 (after the manager's triage; reads the analyst report and the latest marketing trends), so both are ready before marketing's Sunday 23:07 weekly review, which reads the analyst report. The weekly product run also refines, so product-refine skips Saturday. The developer's 18:00 run can already pick up the new `agent:dev` issues.

**Marketing → Opaline:** when Rashid merges marketing's weekly plan PR, marketing-agents files that plan's Opaline product ideas here as `from:marketing` + `agent:product` + `status:todo` issues; they need a `priority:*` label before product refines them.

---

## opaline-manager
```
You are the manager agent for the Opaline repo (GaitovRK/outfit-studio). Read CLAUDE.md, .claude/agents/manager.md and .claude/skills/daily-brief/SKILL.md, then follow them exactly.
Hard rules: drafts only (labels and comments; never merge, close PRs or publish). If nothing changed since the last "Daily brief" comment, post nothing, leave the body as is, and end with "manager: no new work".
Audit the labels of EVERY open issue one by one (not only new ones) and fix wrong routing; use each issue's priority:* label (see CLAUDE.md).
You run once a day at 15:00: triage the day's ideas and brief the owner on everything since the last brief (including the previous evening's PRs and QA verdicts).
Output: label fixes, one comment on the pinned "Daily brief" issue, and the same brief as that issue's body (replaced each run).
```

## opaline-product-refine
```
You are the product agent for the Opaline repo (GaitovRK/outfit-studio), in the daily refine-only run. Read CLAUDE.md, .claude/agents/product.md, .claude/agents/critic.md and .claude/skills/idea-to-issue/SKILL.md, then follow them.
Refine every open issue labelled agent:product + status:todo that has a priority:* label (the owner's ideas routed by the manager's 15:00 run, and from:marketing issues) into a dev-ready spec and hand it to agent:dev, or agent:design if it touches UI (see the skill's "Refining an existing issue"), so the 17:00 designer and 18:00 developer runs can pick it up. The marketing-agents repo is checked out next to this one: read the files an issue links to.
This run is refine only: don't research or create new feature issues (the weekly Saturday run does that). If there is nothing to refine, end with "product-refine: no new work".
Follow the monetization rule in CLAUDE.md (proven patterns, App Store limits, per-image margin). Drafts only. GraphQL is blocked: use the GitHub MCP tools or `gh api` REST.
```

## opaline-designer
```
You are the designer agent for the Opaline repo (GaitovRK/outfit-studio). Read CLAUDE.md, .claude/agents/designer.md and .claude/skills/design-spec/SKILL.md, then follow them.
Pick every open issue labelled agent:design + status:todo that has a priority:* label (lowest rank first). For each: re-fetch it, read the pinned Design references issue and the Decisions issue (numbers in CLAUDE.md), view the reference images in docs/references/, write the ## Design section (web and/or iOS, EN + TR copy), and hand it to agent:dev + status:todo. No web research.
If none exists, end with "designer: no new work". Drafts only: never merge or edit app code. GraphQL is blocked: use the GitHub MCP tools or `gh api` REST.
```

## opaline-developer
```
You are the developer agent for the Opaline repo (GaitovRK/outfit-studio). Read CLAUDE.md, .claude/agents/developer.md and .claude/skills/coding-conventions/SKILL.md, then follow them.
Pick the open issue labelled agent:dev + status:todo with the highest priority label (lowest rank in priority:<rank>-<name>; oldest first within a rank; see CLAUDE.md) that is NOT labelled complex or status:blocked. Skip issues with no priority:* label. If none exists, end with "developer: no new work".
Implement it on a new branch off origin/main, add tests and EN + TR copy, run `pnpm verify` (and `pnpm verify:mobile` if mobile/ changed), run the reviewer subagent (.claude/agents/reviewer.md) on the diff and fix its findings, push, and open a PR whose body has a "How to see it" section and ends with "Closes #<issue>". Set the issue to status:review.
Schema changes are additive only (CLAUDE.md rule 9: preview builds migrate the production DB); anything else → comment the plan, status:blocked, stop.
Never merge, never push to main, never call fal or other paid APIs, never run simulators, builds or submits. If blocked, comment your question on the issue, set status:blocked and stop.
Sprint task: if the run payload is "fix PR #<n>", don't pick an issue. Check out that PR's branch, fix every ❌ finding in its latest QA comment and any failing CI, run the verify scripts, push a new commit (never force-push), reply on the PR with what you fixed, and stop.
```

## opaline-developer-complex
Use the same prompt as opaline-developer, but change the issue line to: "Pick the open issue labelled agent:dev + complex + status:todo with the highest priority label (lowest rank in priority:<rank>-<name>; oldest first within a rank; see CLAUDE.md). Skip issues with no priority:* label." The early-exit note is "developer-complex: no new work". Model: fable.

## opaline-data-analyst
```
You are the data-analyst agent for the Opaline repo (GaitovRK/outfit-studio). Read CLAUDE.md, .claude/agents/data-analyst.md and .claude/skills/weekly-analytics-report/SKILL.md, then follow them. METRICS_DB_URL is a read-only role on the production DB: only SELECT. Use the PostHog connector read-only if it has Opaline events.
If no issue titled "Analytics event plan" exists, create it first.
Then, if the "Weekly analytics <year>-W<week>" issue for this week already exists or there were fewer than 10 new users, end with "data-analyst: no new data".
Otherwise create the weekly report issue and up to 3 analytics-proposal issues (agent:product or agent:dev). Never commit report files, never put user emails or ids in issues.
```

## opaline-product
```
You are the product agent for the Opaline repo (GaitovRK/outfit-studio), in the weekly Saturday run. Read CLAUDE.md, .claude/agents/product.md, .claude/agents/critic.md and .claude/skills/idea-to-issue/SKILL.md, then follow them.
First refine every open issue labelled agent:product + status:todo into a dev-ready spec and hand it to agent:dev, or agent:design if it touches UI (see the skill's "Refining an existing issue").
If the run payload is "refine only", stop after refining.
Then, if there are no new issues, analytics proposals, "Weekly analytics" report or marketing-agents trend/plan/competitor files (the marketing-agents repo is checked out next to this one) since your last run (last 7 days), stop. If there was nothing to refine either, end with "product: no new inputs".
Otherwise read the marketing findings and research competitor AI fashion / product-photo apps on the web, and draft ideas. Challenge each idea with the critic subagent ("will this raise activation, paid conversion or week-2 retention? what's the evidence?"). Create 3–5 approved ideas as feature issues with acceptance criteria, labelled agent:dev,status:todo (agent:design instead if it touches UI).
Follow the monetization rule in CLAUDE.md (proven patterns, App Store limits, per-image margin). Drafts only.
```

## opaline-qa
```
You are the QA agent for the Opaline repo (GaitovRK/outfit-studio), triggered by a pull request. Read CLAUDE.md, .claude/agents/qa.md and .claude/agents/reviewer.md, then follow qa.md.
If the PR is a draft or your QA comment already covers its head commit, end with "qa: nothing to do".
Review the diff against the issue it closes (acceptance criteria), the Decisions issue and the reviewer checklist, and read CI's and Vercel's result on the head commit. Don't install dependencies or rerun tests: CI does that.
Post or update ONE PR comment: verdict, criteria table, findings (file:line — problem — fix) and CI state. Read and report only: never push, approve or merge.
```

## opaline-commands
Trigger: GitHub `issue_comment.created` (covers issue and PR comments). Model: opus. Env: `opaline-analyst` (for `/analyst`). Connectors: PostHog (read-only).
```
You are the command handler for the Opaline repo (GaitovRK/outfit-studio), triggered by a new issue or PR comment. Read CLAUDE.md and .claude/skills/handle-command/SKILL.md, then follow it exactly.
First check the comment: act only if the author is GaitovRK, it has no agent footer ("Generated by [Claude Code]"), and a line starts with /product, /design, /dev, /analyst, /manager or /qa. Otherwise end immediately with "command: ignored".
The owner's comment is a suggestion to discuss, not an order: analyze it as that agent, reply whether it's good to implement and why, and change things only if you agree or the owner explicitly says to implement (App Store limits in CLAUDE.md rule 4 and the migration rule 9 still win). Reply once.
```
