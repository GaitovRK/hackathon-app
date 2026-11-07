# Hackathon App

AI mobile app for the "From Zero to First Dollar" hackathon (RevenueCat × fal, Istanbul App Week, 2026-11-07). Expo app + NestJS API: the user types a prompt, the server runs a fal model, free users get a daily quota, `pro` subscribers (RevenueCat) get more. The concept is set after the 16:10 theme reveal (see `AGENTS.md`).

## Layout
- `mobile/` Expo SDK 57 (iOS + Android), Expo Router, Redux Toolkit + RTK Query, RevenueCat (`react-native-purchases` + `-ui`)
- `server/` NestJS + Prisma (PostgreSQL), deploys to Vercel, Neon in prod
- `.claude/` agent roles + skills, `ops/routines.md` cloud routines, `.github/` CI

Two separate pnpm projects (no workspace: Expo and pnpm hoisting don't mix well). From the root: `pnpm verify:server`, `pnpm verify:mobile`, `pnpm verify`.

## Quick start
**Server**
```bash
cd server
cp .env.example .env          # DATABASE_URL, TEST_DATABASE_URL, JWT_SECRET (32+ chars), FAL_KEY, REVENUECAT_SECRET_KEY
pnpm install
pnpm prisma migrate dev
pnpm start:dev                # http://localhost:3000
curl -X POST localhost:3000/auth/anonymous   # → { token, userId }
```
**Mobile**
```bash
cd mobile
cp .env.example .env          # EXPO_PUBLIC_API_URL (your LAN IP for a phone), RevenueCat public SDK keys
pnpm install
pnpm expo start               # open in the dev client
```
RevenueCat needs native code, so it doesn't run in Expo Go: build a development client once (`pnpm dlx eas-cli build --profile development`, or `pnpm expo run:ios` locally), then use `pnpm expo start`. Without RevenueCat keys the app runs and paywall moments show "purchases are not available". There is no custom paywall screen: every paywall moment presents the RevenueCat dashboard paywall (`mobile/src/services/purchases/presentPaywall.ts`).

## Architecture and security
- **fal key stays on the server.** The app never talks to fal: a key in the bundle can be extracted and drained. The server allows only the models in `server/src/fal/models.ts` (endpoint + zod input schema), so it isn't an open proxy, submits to the fal queue and polls the status.
- **Anonymous auth:** `POST /auth/anonymous` creates a user and returns a long-lived JWT, kept in SecureStore. The user id is also the RevenueCat app user id. A global JWT guard covers every route except `/health` and `/auth/anonymous`. Users only see their own generations (others get 404).
- **Monetization gate on the server:** `GET /me` → `{ userId, isPro, freeLeftToday }`. Pro means the RevenueCat entitlement `pro` is active, checked through the RevenueCat REST API with the secret key and cached for 60 s. Free users get `FREE_DAILY_LIMIT` generations per UTC day. After that the API returns 402 `QUOTA_EXCEEDED` and the app opens the paywall. Pro has its own cap (`PRO_DAILY_LIMIT`) to protect fal credit.
- **Hardening:** helmet, zod validation, throttling (stricter on auth and generations), small JSON body limit, CORS off, env checked with zod at boot. Keys, tokens and signed URLs are never logged.

## Accounts to set up
- **fal:** API key → `FAL_KEY` (server only).
- **RevenueCat:** a project with iOS and Android apps, entitlement `pro`, offering `default` with packages and a paywall. Public SDK keys go in `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `_ANDROID_KEY`, the secret API key in `REVENUECAT_SECRET_KEY` (server).
- **Neon:** a Postgres database → `DATABASE_URL` in Vercel.
- **Vercel:** import `server/` as the root directory and set the env vars. Run `pnpm prisma migrate deploy` against Neon.
