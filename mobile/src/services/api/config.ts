/** Backend base URL from `EXPO_PUBLIC_API_URL` (inlined at build time), without a trailing slash. */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");
