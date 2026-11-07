---
name: pitch
description: Owner-run at ~19:00 (/pitch). Builds the 2-minute pitch script, likely Q&A with answers, and the submission checklist from Decisions #2, merged PRs and the app. Local only.
---
Inputs: Decisions #2, AGENTS.md Concept, merged PRs (`gh api 'repos/GaitovRK/hackathon-app/pulls?state=closed'`), screens in `mobile/src/app/`, paywall (offering `default`, entitlement `pro`), `server/src/fal/models.ts` (cost per use).

Output (one reply, no files):
1. **2-minute script** (~260 words, timestamps): 0:00 hook + problem · 0:20 live demo (exact taps; fallback if fal is slow) · 1:10 **monetization**: paywall placement, prices + trial, why users pay, fal cost per use vs price, path to first dollar · 1:45 next + ask.
2. **Demo checklist:** dev build installed, sandbox tester signed in, server reachable, fresh install or reset quota (to show the paywall), a pre-generated fallback result, brightness / Do Not Disturb.
3. **Likely Q&A** (6–8, one-line answers): retention, cost at scale, competition, why RevenueCat / fal, key security (fal key server-side, quota, rate limits), App Store 3.1.1 / 3.1.2, what AI built.
4. **Submission checklist (19:30):** repo/PR links, demo video or screenshots, RevenueCat project (`pro`, `default`), description, team, anything the organizers asked for.
