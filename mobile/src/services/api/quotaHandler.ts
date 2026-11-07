/**
 * What to do when the API answers 402 QUOTA_EXCEEDED. The root layout registers a handler that
 * pushes /paywall; keeping it a callback keeps the store free of navigation imports (and testable).
 */
let handler: (() => void) | null = null;

export function setQuotaExceededHandler(next: (() => void) | null) {
  handler = next;
}

export function notifyQuotaExceeded() {
  handler?.();
}
