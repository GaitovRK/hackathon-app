import { Alert } from "react-native";
import { t } from "@/i18n/t";
import { PAYWALL_RESULT } from "react-native-purchases-ui";
import { didPurchase, hasProInStore, openPaywall } from "./openPaywall";
import { isPurchasingEnabled } from "./revenueCat";

/**
 * Every paywall moment (402 QUOTA_EXCEEDED / ITEM_LIMIT / REFRESH_LIMIT, the first wow, the Try Pro pill)
 * goes through here: no custom paywall screen, only the RevenueCat dashboard paywall (RevenueCatUI) for the
 * `default` offering. Price, period, terms and Restore live on that paywall (3.1.2); Restore is also in
 * Settings. The root layout registers what to refresh after a purchase, so this file stays store-free.
 */
let onUnlocked: (() => void) | null = null;

export function setPaywallUnlockedHandler(next: (() => void) | null) {
  onUnlocked = next;
}

/**
 * Presents the dashboard paywall unless the user already has `pro`. Resolves true after a purchase / restore,
 * and also when the paywall is skipped because RevenueCat already has `pro` while the server still said free
 * (a 402 right after buying): the unlocked handler then syncs the server instead of nothing happening.
 */
export async function presentPaywall(): Promise<boolean> {
  if (!isPurchasingEnabled()) {
    Alert.alert(t("paywall.title"), t("paywall.unavailable"));
    return false;
  }
  try {
    const result = await openPaywall();
    const unlocked = didPurchase(result) || (result === PAYWALL_RESULT.NOT_PRESENTED && (await hasProInStore()));
    if (unlocked) onUnlocked?.();
    return unlocked;
  } catch {
    return false;
  }
}
