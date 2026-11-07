import { useState } from "react";
import { Alert } from "react-native";
import { t } from "@/i18n/t";
import { restorePurchases } from "@/services/purchases/openPaywall";
import { api } from "@/store/api";
import { useAppDispatch } from "@/store";

/** Restore Purchases (Guideline 3.1.1): reachable in Settings (the dashboard paywall has its own). Syncs /me afterwards. */
export function useRestorePurchases() {
  const dispatch = useAppDispatch();
  const [restoring, setRestoring] = useState(false);

  const restore = async () => {
    setRestoring(true);
    try {
      const pro = await restorePurchases();
      void dispatch(api.endpoints.syncMe.initiate());
      Alert.alert(t(pro === null ? "paywall.unavailable" : pro ? "paywall.restored" : "paywall.nothingToRestore"));
    } catch {
      Alert.alert(t("status.error"));
    } finally {
      setRestoring(false);
    }
  };

  return { restore, restoring };
}
