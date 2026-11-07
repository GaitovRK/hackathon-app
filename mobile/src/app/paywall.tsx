import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { Screen } from "@/components/Layout/Screen";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { useRestorePurchases } from "@/hooks/purchases/useRestorePurchases";
import { t } from "@/i18n/t";
import { didPurchase, openPaywall } from "@/services/purchases/openPaywall";
import { isPurchasingEnabled } from "@/services/purchases/revenueCat";
import { useAppDispatch } from "@/store";
import { api } from "@/store/api";
import { useTheme } from "@/theme/useTheme";

/** Shown on 402 QUOTA_EXCEEDED: opens the RevenueCat paywall (offering `default`, entitlement `pro`). */
export default function PaywallScreen() {
  const { colors, fontSize } = useTheme();
  const dispatch = useAppDispatch();
  const { restore, restoring } = useRestorePurchases();
  const [opening, setOpening] = useState(false);

  const showPlans = async () => {
    setOpening(true);
    try {
      if (didPurchase(await openPaywall({ force: true }))) {
        dispatch(api.util.invalidateTags(["Me"]));
        router.back();
      }
    } finally {
      setOpening(false);
    }
  };

  return (
    <Screen title={t("paywall.title")}>
      <Text style={{ color: colors.foreground, fontSize: fontSize.lg }}>{t("paywall.body")}</Text>
      {isPurchasingEnabled() ? null : <StatusMessage kind="info" message={t("paywall.unavailable")} />}
      <ButtonPrimary testID="paywall-open" label={t("paywall.open")} onPress={() => void showPlans()} loading={opening} />
      <ButtonSecondary testID="paywall-restore" label={t("paywall.restore")} onPress={() => void restore()} loading={restoring} />
    </Screen>
  );
}
