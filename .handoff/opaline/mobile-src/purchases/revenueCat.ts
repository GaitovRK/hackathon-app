import { Platform } from "react-native";
import Purchases from "react-native-purchases";

/** RevenueCat public SDK key of this platform's store (see .env.example); without it the paywall shows "unavailable". */
const API_KEY = Platform.select({ ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY, android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY });

export const isPurchasingEnabled = () => !!API_KEY;

/** RevenueCat's customer id is our user id, so the webhook knows whom to credit. */
export async function identifyPurchaser(userId: string) {
  if (!API_KEY) return;
  if (await Purchases.isConfigured()) await Purchases.logIn(userId);
  else Purchases.configure({ apiKey: API_KEY, appUserID: userId });
}

/** Back to an anonymous customer, so the next account's purchases aren't credited to this one. */
export async function resetPurchaser() {
  if (!API_KEY || !(await Purchases.isConfigured())) return;
  if (!(await Purchases.isAnonymous())) await Purchases.logOut();
}

/** The user closed the App Store sheet: not an error. */
export const isPurchaseCancelled = (error: unknown) => (error as { userCancelled?: boolean | null } | null)?.userCancelled === true;
