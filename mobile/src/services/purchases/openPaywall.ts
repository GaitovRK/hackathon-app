import Purchases from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { DEFAULT_OFFERING, isPurchasingEnabled, PRO_ENTITLEMENT } from "./revenueCat";

async function ready() {
  return isPurchasingEnabled() && (await Purchases.isConfigured());
}

async function defaultOffering() {
  const offerings = await Purchases.getOfferings().catch(() => null);
  return offerings?.all[DEFAULT_OFFERING] ?? offerings?.current ?? null;
}

/**
 * Presents the RevenueCat paywall (designed in the dashboard) for the `default` offering, unless the
 * user already has the `pro` entitlement. Resolves when it closes.
 */
export async function openPaywall({ force = false }: { force?: boolean } = {}): Promise<PAYWALL_RESULT> {
  if (!(await ready())) return PAYWALL_RESULT.NOT_PRESENTED;
  const offering = await defaultOffering();
  const options = { ...(offering ? { offering } : {}), displayCloseButton: true };
  if (force) return RevenueCatUI.presentPaywall(options);
  return RevenueCatUI.presentPaywallIfNeeded({ ...options, requiredEntitlementIdentifier: PRO_ENTITLEMENT });
}

export const didPurchase = (result: PAYWALL_RESULT) => result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;

/** Restores store purchases; resolves whether `pro` is active afterwards, or null when purchases are unavailable. */
export async function restorePurchases(): Promise<boolean | null> {
  if (!(await ready())) return null;
  const info = await Purchases.restorePurchases();
  return !!info.entitlements.active[PRO_ENTITLEMENT];
}
