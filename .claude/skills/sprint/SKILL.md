---
name: sprint
description: Owner-triggered build round (/sprint [devs=N], default 3). From the owner's local Claude Code: snapshot → manager routing → parallel developer subagents in their own worktrees → reviewer → PRs → QA → one fix round → report. Local only.
---
Run only when the owner asks. Agents hand off through GitHub (labels, comments, #2).

1. **Time check.** After 19:00: only `bug` issues and demo polish. After 19:20: refuse and tell the owner to submit.
2. **Snapshot** (`gh api` REST): open issues by `agent:*` / `status:*` / `priority:*`, open PRs with their latest QA comment. Plan in ≤ 4 lines. Stop if nothing is eligible.
3. **Manager** (subagent `manager`): routes unrouted issues, posts the brief on #3.
4. **Product / designer** only if an `agent:product` / `agent:design` + `status:todo` issue with a priority exists, ≤ 10 min each.
5. **Developers:** re-fetch issues. Eligible = open `agent:dev` + `status:todo` + a `priority:*` label, not `status:blocked`, lowest rank first. Start **up to N parallel local `developer` subagents** in one message, one per issue, `model: opus` (`fable` for `complex`). Each brief names the issue and its setup: fetch origin, worktree `../hackathon-app-worktrees/<issue>-<desc>` on `<type>/<issue>-<desc>` off `origin/main`; own DB `hackathon_app_<issue>` in `server/.env` (createdb, then `pnpm --dir server prisma migrate dev`); own `PORT` (3000 + n) and Metro port (8081 + n); touch only the issue's files; reviewer → PR → `status:review`; ≤ 30 min, then open what it has with ⚠️ notes.
6. **QA:** the `hackathon-qa` cloud routine comments on each new PR. No QA comment on the head SHA after 5 min → run a local `qa` subagent on it.
7. **Fix round (once):** each PR with ❌ QA or failing CI → a `developer` subagent with `fix PR #<n>`. QA again. No second loop.
8. **Report:** table PR · issue · QA · CI · "How to see it"; blocked issues + questions; time left to the 19:00 freeze and the suggested next sprint.

Limits: max 3 developers at once unless the owner says more; never merge, close, approve or change `priority:*`; a subagent failing twice → stop that issue, report, continue. After the owner merges: remove the worktree, delete the branch, drop its DB.
