# server

NestJS + Prisma API: anonymous JWT auth, fal.ai generation proxy, RevenueCat-gated daily quota.

Local: `cp .env.example .env`, fill it in, then `pnpm install && pnpm prisma migrate dev && pnpm start:dev`.

## Deploy (Vercel, owner only)
- Live at `https://flick-api.gaitovlabs.com` (Vercel project `flick-api`, functions in fra1). Release builds of the app call it, hard-coded in `mobile/src/services/api/config.ts`; the domain is attached in Vercel, and gaitovlabs.com's DNS already routes subdomains to Vercel.
- One function (`api/index.js`) serves the compiled Nest app from `dist/`; `vercel.json` rewrites every path to it. Vercel's NestJS preset is not used: its own type-check fails on code that our `tsc` build accepts.
- Database: Neon `flick-db` (Frankfurt), connected through the Vercel integration, which sets `DATABASE_URL` / `DATABASE_URL_UNPOOLED`. Every deploy runs `prisma migrate deploy` over the unpooled URL before building.
- Other env (Production + Preview): `JWT_SECRET`, `FAL_KEY`, `REVENUECAT_SECRET_KEY`, `NODEJS_HELPERS=0` (Express parses bodies itself). The limits use their defaults from `src/config/env.ts` unless set.
- Deploy from this folder: `pnpm dlx vercel@latest deploy --prod` (`.vercelignore` keeps `.env` out of the upload). The repo is not git-connected, so merging to `main` does not deploy.
- Check: `curl https://flick-api.gaitovlabs.com/health` → `{"ok":true}`.
