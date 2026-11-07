---
name: daily-brief
description: Write the manager's brief and route issues to agents with labels. Use for the manager's daily 15:00 run.
---
Use the GitHub MCP tools or `gh api` REST (GraphQL is blocked in cloud runs, see CLAUDE.md).
1. Read the pinned "Daily brief" issue #97 and its latest comment.
2. Gather (since the last brief comment), including each issue's `priority:*` label:
   - all open issues with body, labels, updated time
   - open PRs with CI + Vercel status and their latest QA comment; PRs merged since the last brief
   - each issue's `priority:*` label (set by the owner, see CLAUDE.md)
3. **Audit every open issue, one by one** (not only new ones): read its body and decide if its labels are right per step 4. Fix wrong labels. Keep a list `#n: old → new (reason)`.
4. Rules — route every open issue (re-check existing labels too, fix wrong ones). **Ready for dev** = clear problem + acceptance criteria (+ design notes for UI) + which platform. Bugs with repro steps and ready non-UI features → `agent:dev`; ready UI features without a `## Design` section → `agent:design`; rough notes, ideas, `from:marketing` issues or features not ready for dev → `agent:product` (product refines them and hands them to dev); data questions → `agent:analyst`; non-code tasks for the owner (App Store / RevenueCat / Vercel setup, pose photos, integrations needing accounts like Meta or ikas, marketing to-dos) → remove `agent:*`. Add `web` / `mobile` when the platform is clear. Add `status:todo` if no status. Skip reference issues: #95 Decisions, #97 Daily brief and anything labelled `design:references` (#96) get no `agent:*`/`status:*`. Never add or change `priority:*` labels — the owner sets them.
Exit early (no comment, body untouched) only if nothing changed since the last brief AND the audit changed no labels.
5. Read the Decisions issue #95 and flag any open issue whose spec contradicts a decision (reroute it to `agent:product`).
6. Flag: `agent:dev` / `agent:design` / `agent:product` issues with no `priority:*` label (owner adds a `priority:*` label; agents skip them), `status:blocked`, `status:in-progress` with no update for 3 days, PRs with failing CI or open > 5 days, open PRs labelled `migration` (owner checks before merge).
7. Post the brief (≤ 15 lines) twice, same text:
   - as a new comment on #97 (history; step 2 reads it next run);
   - as the issue **body**, replacing the old body, so the owner sees the latest brief at the top: `gh api -X PATCH repos/GaitovRK/outfit-studio/issues/97 -f body=...`.
One run a day (15:00): it routes the day's ideas (the "Rerouted" and "Needs priority" lines) and reports everything since the last brief, including the previous evening's PRs and QA verdicts (the "Ready for review" line).
```
## Brief YYYY-MM-DD HH:MM
**Ready for review:** PR #.. (closes #..) — QA ✅ · Vercel preview <link>
**Needs changes:** PR #.. — QA ❌ <one line>
**Done:** #.. merged
**Blocked / stale (needs you):** #.. — reason
**Rerouted:** #.. agent:dev → agent:product (no acceptance criteria)
**Needs priority:** #..
**Next up per agent (by priority):** product #.., design #.., dev #.. (P0)
```
