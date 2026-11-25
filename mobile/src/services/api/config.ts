/** Production backend: release builds (TestFlight / App Store) always call it; the server is deployed to this domain. */
export const PRODUCTION_API_URL = "https://flick-api.gaitovlabs.com";

/**
 * Dev builds use `EXPO_PUBLIC_API_URL` (LAN / localhost, inlined at build time); release builds always use
 * the production backend, so a local URL in `.env` never ships. No trailing slash.
 */
export function resolveApiUrl(isDev: boolean, envUrl: string | undefined) {
  const url = isDev ? envUrl || "http://localhost:3000" : PRODUCTION_API_URL;
  return url.replace(/\/+$/, "");
}

export const API_URL = resolveApiUrl(__DEV__, process.env.EXPO_PUBLIC_API_URL);
