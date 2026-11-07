import Purchases from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { isPurchasingEnabled } from "./revenueCat";

const purchasesReady = async () => isPurchasingEnabled() && (await Purchases.isConfigured());

/** RevenueCat's Customer Center (the plan, cancel / change it, restore, contact); false when purchases are off. */
export async function presentCustomerCenter() {
  if (!(await purchasesReady())) return false;
  await RevenueCatUI.presentCustomerCenter();
  return true;
}

export type RestoreResult = "restored" | "none" | "unavailable";

/** Syncs this Apple ID's purchases to the signed-in account (App Store guideline 3.1.1: Restore Purchases). */
export async function restorePurchases(): Promise<RestoreResult> {
  if (!(await purchasesReady())) return "unavailable";
  const info = await Purchases.restorePurchases();
  return info.allPurchasedProductIdentifiers.length > 0 ? "restored" : "none";
}
