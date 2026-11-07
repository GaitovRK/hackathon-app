---
name: status-brief
description: Manager's on-demand status brief on the pinned Brief issue #3 (body = latest, comments = history). Used at the start of each sprint or when the owner asks.
---
1. Read Decisions #2 and the last comment on #3 (its time = "since").
2. Fetch (`gh api` REST) open issues and PRs, labels, latest QA comment per PR, CI state on each PR head.
3. Fix routing: every open non-`reference` issue gets one `agent:*` and one `status:*` (never touch `priority:*`).
4. Write the brief (≤ 15 lines): time + minutes to the 19:00 freeze / 19:30 submit; PRs ready for the owner (QA ✅ + CI green) to merge; in progress; blocked + the question; risks to the demo; suggested next step.
5. Post it as a comment on #3 and replace #3's body with it (`gh api -X PATCH repos/GaitovRK/hackathon-app/issues/3 -f body=...`).
Nothing changed since the last brief → post nothing, print `manager: no new work`.
