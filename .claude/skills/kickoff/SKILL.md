---
name: kickoff
description: Owner-run right after the 16:10 theme reveal (/kickoff <theme + judging criteria>). Product drafts 4–5 ideas, critic challenges them, owner picks one, then the decision, concept and 6–10 small issues are recorded. Local only.
---
Run in the owner's local Claude Code. Timebox: **≤ 20 min total** (ideas by 16:20, issues by 16:30).

## 1. Ideas (product subagent, opus)
Give it the theme, judging criteria, AGENTS.md and the current skeleton (`server/src/fal/models.ts`, `mobile/src/app/`). It drafts **4–5 ideas**, each ≤ 120 words:
- One-line pitch + who it's for.
- **Scores 1–5** per judging criterion (build, creativity, monetization, plus any the owner gave) and **demo-ability in 2 minutes** (one phone, live fal call ≤ 15 s or a cached fallback).
- **RevenueCat monetization:** free vs `pro`, where the paywall appears (right after first value), price points (e.g. weekly + annual, 3-day trial), why users pay.
- **fal model(s):** endpoint ids (check fal.ai model pages), latency, **cost per use**, margin vs price.
- Build size (server / mobile / schema); must fit 16:30–19:00 with 3 parallel developers.

## 2. Critic (critic subagent, sonnet)
Send all ideas at once. Show the owner a table: idea · scores · monetization · fal cost/use · critic verdict, plus a one-line recommendation.

## 3. Owner picks
Wait for the owner's pick (and tweaks). Don't proceed without it.

## 4. Record
- Append to Decisions #2 (keep existing text): concept, monetization plan (free tier, `pro` contents, prices, trial), fal model(s), time.
- Fill AGENTS.md **Concept** (2–3 lines) in the first issue's PR.

## 5. Issues (6–10)
Create with `gh api repos/GaitovRK/hackathon-app/issues` (feature template body):
- Each **≤ 30 min of agent work**, clear acceptance criteria, `mobile` and/or `server`, `agent:dev` (or `agent:design` for new screens) + `status:todo`; `complex` only if unavoidable.
- Split so 3 developers work in parallel on different files. Include a "demo path" issue (happy path, fallback image if fal is slow) and a "paywall placement + copy" issue.
- **Proposed priorities** (`priority:1-p0` / `2-p1` / `3-p2`) in a table. Apply them **only after the owner confirms**.

## 6. Report
Issue table (number · title · labels · proposed priority) and the next step: "run `/sprint`".
