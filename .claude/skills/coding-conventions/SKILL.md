---
name: coding-conventions
description: How code is written in this repo (NestJS + Prisma server, Expo SDK 57 app). Use before implementing any agent:dev issue.
---
- Read `AGENTS.md` and, for app work, `mobile/AGENTS.md`. Expo SDK 57: check https://docs.expo.dev/llms.txt and versioned docs before using an Expo API; native packages via `pnpm expo install` in `mobile/`. NestJS / Prisma / `@fal-ai/client` / RevenueCat: check installed types or docs, never memory.
- pnpm only (`pnpm dlx`). `server/` and `mobile/` are separate pnpm projects.
- **Server:** one Nest module per domain (`src/<domain>/`), zod at the boundary, global JWT guard (only `/health` and `/auth/anonymous` are `@Public()`), ownership checks → 404. New fal models only in `src/fal/models.ts` (endpoint + zod schema). Quota / pro logic only in the billing module. Error shape `{ statusCode, code, message }`; 402 `QUOTA_EXCEEDED` = show the paywall.
- **App:** routes in `src/app/`, components by type `src/components/<Group>/<Name>.tsx`, hooks/services by domain, API only via RTK Query `src/store/api.ts`, state only Redux Toolkit, theme tokens only (light + dark, no raw hex), every string in `mobile/messages/en.json`. RevenueCat only via `src/services/purchases/` (offering `default`, entitlement `pro`); Restore Purchases on Paywall and Settings; the server decides pro for quota.
- Reuse before adding (DRY).
- **DB:** edit `server/prisma/schema.prisma`, then `pnpm --dir server prisma migrate dev --name <name>`; additive only; label `migration`.
- **Tests:** server `*.spec.ts` next to the file + Supertest e2e in `server/test/` (test DB); app jest-expo + RNTL (screen tests in `mobile/src/__tests__/app/`, never inside `src/app/`: Expo Router bundles every file there as a route); new user flow → Maestro flow in `mobile/.maestro/` (never run). Mock `@fal-ai/client`, RevenueCat `fetch`, `react-native-purchases(-ui)`. Bug fix → reproducing test.
- **Dev preview** for new app UI: entry in `mobile/src/dev/previews.tsx` (mock data). `mobile/src/app/_layout.tsx` gets two lines ending `DEV-PREVIEW`: `import { DevPreviewButton } from "@/dev/DevPreviewButton"; // DEV-PREVIEW` and `<DevPreviewButton />{/* DEV-PREVIEW */}`; removed before merge with `bash mobile/scripts/agents/remove-dev-preview.sh`.
- **"How to see it"** in the PR: app → `pnpm --dir mobile start` → Preview → <entry>; server → curl steps.
- Before a commit: `pnpm verify:server` / `pnpm verify:mobile` green; small commits, bulleted bodies, `(#<issue>)` in the subject.
