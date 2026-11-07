import Purchases from "react-native-purchases";
import RevenueCatUI, { CustomVariableValue, PAYWALL_RESULT } from "react-native-purchases-ui";
import type { PaywallTrigger } from "@shared/lib/analytics/events";
import { track } from "@/services/analytics";
import { isPurchasingEnabled } from "./revenueCat";

export type { PaywallTrigger };

export type PaywallParams = {
  trigger?: PaywallTrigger;
  /** Credits the user is short by (`out_of_credits`). */
  need?: number;
};

/**
 * RevenueCat placement per trigger (dashboard → Paywalls → Placements), so each moment can show its
 * own offering and paywall and be A/B tested there. A placement with nothing set up falls back to the
 * current offering.
 */
export const PAYWALL_PLACEMENTS: Record<PaywallTrigger, string> = {
  first_result: "first_result",
  out_of_credits: "out_of_credits",
  pill: "credits_pill",
  /** A locked model card (#81). */
  model_locked: "model_locked",
};

/**
 * Presents the RevenueCat paywall (designed in the dashboard) for a trigger; resolves when it closes.
 * `need` reaches the paywall text as `{{ custom.need_credits }}`.
 */
export async function presentPaywall({ trigger = "pill", need }: PaywallParams = {}): Promise<PAYWALL_RESULT> {
  if (!isPurchasingEnabled() || !(await Purchases.isConfigured())) return PAYWALL_RESULT.NOT_PRESENTED;
  const offering = await Purchases.getCurrentOfferingForPlacement(PAYWALL_PLACEMENTS[trigger]).catch(() => null);
  track("paywall_viewed", { trigger });
  return RevenueCatUI.presentPaywall({
    ...(offering ? { offering } : {}),
    displayCloseButton: true,
    customVariables: { need_credits: CustomVariableValue.number(need ?? 0) },
  });
}
