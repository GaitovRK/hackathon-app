# server

NestJS + Prisma API: anonymous JWT auth, fal.ai generation proxy, RevenueCat-gated daily quota.

Local: `cp .env.example .env`, fill it in, then `pnpm install && pnpm prisma migrate dev && pnpm start:dev`.

## Deploy (Vercel)
- Import the repo in Vercel with Root Directory `server/`; NestJS is detected zero-config.
- Production domain: `flick-api.gaitovlabs.com` (add it in Vercel Domains + a CNAME at gaitovlabs.com). Release builds of the app call it, hard-coded in `mobile/src/services/api/config.ts`.
- Set all `.env.example` vars (except TEST_DATABASE_URL) in Project Settings, Environment Variables.
- Run `pnpm prisma migrate deploy` against the production DB before or during each release.
