import { Platform } from "react-native";
import Purchases from "react-native-purchases";

/** Entitlement and offering set up in the RevenueCat dashboard. */
export const PRO_ENTITLEMENT = "pro";
export const DEFAULT_OFFERING = "default";

/** RevenueCat public SDK key for this platform (see .env.example); without it purchases are disabled. */
const apiKey = () =>
  Platform.select({ ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY, android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY }) || undefined;

export const isPurchasingEnabled = () => !!apiKey();

/** RevenueCat's app user id is our user id, so the backend webhook knows whom to upgrade. Skipped without a key. */
export async function configurePurchases(userId: string) {
  const key = apiKey();
  if (!key) return;
  if (await Purchases.isConfigured()) await Purchases.logIn(userId);
  else Purchases.configure({ apiKey: key, appUserID: userId });
}

/** The user closed the store sheet: not an error. */
export const isPurchaseCancelled = (error: unknown) => (error as { userCancelled?: boolean | null } | null)?.userCancelled === true;
