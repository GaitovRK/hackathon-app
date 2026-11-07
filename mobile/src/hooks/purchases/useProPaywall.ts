import { useCallback, useState } from "react";
import { PAYWALL_RESULT } from "react-native-purchases-ui";
import { didPurchase, openPaywall } from "@/services/purchases/openPaywall";
import { openPaywallScreen } from "@/services/purchases/paywallRoute";
import { useAppDispatch } from "@/store";
import { api } from "@/store/api";

/**
 * Every locked / Pro moment (weather row, locked ideas, outfit score) calls this: the RevenueCat
 * dashboard paywall is presented (no custom paywall UI); a build without purchases falls back to the
 * in-app paywall screen so the moment is still visible. Resolves true after a purchase or restore.
 */
export function useProPaywall() {
  const dispatch = useAppDispatch();
  const [opening, setOpening] = useState(false);
  const open = useCallback(async (): Promise<boolean> => {
    setOpening(true);
    try {
      const result = await openPaywall({ force: true });
      if (result === PAYWALL_RESULT.NOT_PRESENTED) {
        openPaywallScreen("PRO_FEATURE");
        return false;
      }
      if (!didPurchase(result)) return false;
      dispatch(api.util.invalidateTags(["Me", "Outfit"]));
      return true;
    } finally {
      setOpening(false);
    }
  }, [dispatch]);
  return { open, opening };
}
