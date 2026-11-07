import { router } from "expo-router";
import type { PaywallCode } from "@/services/api/types";

export type PaywallReason = PaywallCode | "FIRST_WOW";

/** Opens the in-app paywall screen (modal) with the reason it was shown. One place for every paywall moment. */
export function openPaywallScreen(reason: PaywallReason) {
  router.push({ pathname: "/paywall", params: { reason } });
}
