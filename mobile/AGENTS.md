# Mobile (Expo SDK 57)

Expo / React Native app for iOS + Android. Read the repo `AGENTS.md` first.

## Expo has changed: do not trust your training data
Before touching an Expo, EAS or React Native API: check the `expo` major in `package.json`, read https://docs.expo.dev/versions/v57.0.0/ and https://docs.expo.dev/llms.txt. Never answer from memory.

## Commands (run in `mobile/`)
```bash
pnpm expo install <package>   # ALWAYS instead of pnpm add (SDK-compatible versions)
pnpm start                    # Metro; open the dev client (RevenueCat needs a dev build, not Expo Go)
pnpm typecheck && pnpm lint && pnpm test
pnpm dlx expo-doctor
```

## Rules
- Expo Router: routes in `src/app/` (`(tabs)/` Home/History/Settings, `paywall` modal, `dev/preview`). Non-route code outside `src/app/`.
- API only through RTK Query `src/store/api.ts` (401 → anonymous re-auth, 402 `QUOTA_EXCEEDED` → `/paywall`). Session JWT in `expo-secure-store`; the user id is the RevenueCat app user id.
- RevenueCat only via `src/services/purchases/` (offering `default`, entitlement `pro`); Restore Purchases on Paywall and Settings.
- Components by type in `src/components/<Group>/`; theme tokens from `src/theme/` (light + dark, no raw hex); copy in `messages/en.json` via `t()`.
- `ios/` and `android/` are generated (CNG) and not committed. Native changes → new dev build (`pnpm dlx eas-cli build --profile development`, owner only).
- Never run simulators, EAS builds or submits from an agent. Maestro flows in `.maestro/` are written, not run.
- Dev preview: `src/dev/previews.tsx` + `DevPreviewButton` (two `DEV-PREVIEW` lines in `src/app/_layout.tsx`, removed with `bash scripts/agents/remove-dev-preview.sh`).
