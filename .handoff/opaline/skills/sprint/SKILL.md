---
name: sprint
description: Owner-triggered work session (/sprint [devs=N]). From the owner's local Claude Code, runs the cloud routines in order (manager → product → designer → developers → QA → one fix round) and reports. Local only, never from a cloud routine.
---
Run only when the owner asks (`/sprint`, optional `devs=N`, default 3). Each step is a **fresh routine run** (`RemoteTrigger` `run`), never an `Agent` subagent: subagents can't start the developer's reviewer and work from stale context. Agents hand off through GitHub only (labels, comments, #95).

Load `RemoteTrigger` with ToolSearch first. Routine ids:
| routine | trigger_id |
|---|---|
| manager | `trig_01Hxd5UsXx4ir4zJs5YA23L1` |
| product (opaline-product-refine: refine only, opus) | `trig_01YZrjCmdBxC75q3VxB2Z56G` |
| designer | `trig_01Dm8tkhn63uZAwY5NfCRF8U` |
| developer | `trig_01Khwy3zzy3PGQULNRLJv2m5` |
| developer-complex | `trig_01FX1xpGXssUUShEAsZxUUKj` |
| qa | `trig_01FudmrJ5aHiFrVqR3bEtdWK` |

**Waiting for a run:** after `run`, keep the returned `session_id`. Start a background Bash `sleep 120` as a timer; when it fires, `list_runs` for that routine and find the session. Done = `worker_status: idle` and `last_event_at` older than 60 s. Then read only the tail of `get_run_log` (its `result:` line). Give up on a run after 40 min and report it.

## Steps
1. **Snapshot** (`gh api`, REST): open issues by `agent:*` / `status:*` / `priority:*`, open PRs with their latest QA comment. Tell the owner the plan in ≤ 4 lines (what each step will pick up). Stop if nothing is eligible anywhere.
2. **Manager:** run it, wait. It routes issues and posts the brief.
3. **Product:** if any open `agent:product` + `status:todo` issue has a `priority:*` label, run product with body `{"text": "refine only"}`, wait.
4. **Designer:** if any open `agent:design` + `status:todo` issue has a `priority:*` label, run the designer, wait.
5. **Developers:** re-fetch issues. `n` = open `agent:dev` + `status:todo` with a `priority:*` label, not `complex`, not `status:blocked`. Run the developer `min(n, devs)` times, **2 min apart** (each run marks its issue `status:in-progress` first, so the next picks another). If a `complex` one is eligible, run developer-complex once. Wait for all.
6. **QA:** QA starts by itself on each new or updated ready PR. For every PR from step 5, wait until its QA comment covers the head commit; after 10 min without one, run QA with `{"text": "review PR #<n>"}`.
7. **Fix round (once):** for each PR whose QA verdict is ❌ or whose CI fails, run the developer with `{"text": "fix PR #<n>"}`, 2 min apart, wait, then wait for QA again (step 6). Don't loop a second time; leave what's left for the owner.
8. **Report** to the owner, short:
   - table: PR · issue · QA verdict · CI · Vercel preview · "How to see it" present
   - issues now `status:blocked` and their questions
   - runs started (count per routine) and anything that failed or timed out

## Limits
- At most 10 routine runs per sprint unless the owner says more.
- Avoid 22:00–07:00 Istanbul (Block Link and marketing routines run then); if the owner starts a sprint in that window, say so and ask before starting.
- Never merge, close, approve or change `priority:*` labels; never start the data-analyst unless the owner asks.
- A run that fails twice: stop that step, report it, continue with the rest.
