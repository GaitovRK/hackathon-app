import type { PaywallCode } from "./types";

/**
 * What to do when the API answers 402 (QUOTA_EXCEEDED, ITEM_LIMIT, REFRESH_LIMIT). The root layout
 * registers a handler that presents the RevenueCat dashboard paywall; keeping it a callback keeps the store free of navigation
 * imports (and testable).
 */
let handler: ((code: PaywallCode) => void) | null = null;

export function setQuotaExceededHandler(next: ((code: PaywallCode) => void) | null) {
  handler = next;
}

export function notifyQuotaExceeded(code: PaywallCode = "QUOTA_EXCEEDED") {
  handler?.(code);
}
