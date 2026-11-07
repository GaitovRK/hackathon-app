import { useCallback, useState } from "react";
import { presentPaywall } from "@/services/purchases/presentPaywall";

/**
 * Every locked / Pro moment in the outfit flows (weather row, locked ideas, outfit score) calls this: the
 * RevenueCat dashboard paywall via `presentPaywall` (no custom paywall UI), with an `opening` flag for the
 * button. Resolves true after a purchase or restore.
 */
export function useProPaywall() {
  const [opening, setOpening] = useState(false);
  const open = useCallback(async (): Promise<boolean> => {
    setOpening(true);
    try {
      return await presentPaywall();
    } finally {
      setOpening(false);
    }
  }, []);
  return { open, opening };
}
