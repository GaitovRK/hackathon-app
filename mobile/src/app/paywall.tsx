import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { Screen } from "@/components/Layout/Screen";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { useRestorePurchases } from "@/hooks/purchases/useRestorePurchases";
import { t, type MessageKey } from "@/i18n/t";
import { didPurchase, openPaywall } from "@/services/purchases/openPaywall";
import type { PaywallReason } from "@/services/purchases/paywallRoute";
import { isPurchasingEnabled } from "@/services/purchases/revenueCat";
import { useAppDispatch } from "@/store";
import { api } from "@/store/api";
import { useTheme } from "@/theme/useTheme";

const REASONS: PaywallReason[] = ["QUOTA_EXCEEDED", "ITEM_LIMIT", "REFRESH_LIMIT", "FIRST_WOW"];

/**
 * Paywall moments: the first wow (right after the first outfits), ITEM_LIMIT, REFRESH_LIMIT. Opens the
 * RevenueCat paywall (offering `default`, entitlement `pro`); price, period and Restore are on screen (3.1.2).
 */
export default function PaywallScreen() {
  const { colors, fontSize, fontFamily } = useTheme();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const dispatch = useAppDispatch();
  const { restore, restoring } = useRestorePurchases();
  const [opening, setOpening] = useState(false);
  const reasonKey = REASONS.includes(reason as PaywallReason) ? (`paywall.reason.${reason}` as MessageKey) : null;

  const showPlans = async () => {
    setOpening(true);
    try {
      if (didPurchase(await openPaywall({ force: true }))) {
        dispatch(api.util.invalidateTags(["Me", "Outfit"]));
        router.back();
      }
    } finally {
      setOpening(false);
    }
  };

  return (
    <Screen title={t("paywall.title")} background={colors.accentSoft}>
      {reasonKey ? <Text style={{ color: colors.foreground, fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold }}>{t(reasonKey)}</Text> : null}
      <Text style={{ color: colors.foreground, fontSize: fontSize.lg, fontFamily: fontFamily.body }}>{t("paywall.body")}</Text>
      <Text style={{ color: colors.muted, fontSize: fontSize.sm, fontFamily: fontFamily.body }}>{t("paywall.terms")}</Text>
      {isPurchasingEnabled() ? null : <StatusMessage kind="info" message={t("paywall.unavailable")} />}
      <ButtonPrimary testID="paywall-open" label={t("paywall.open")} onPress={() => void showPlans()} loading={opening} />
      <ButtonSecondary testID="paywall-restore" label={t("paywall.restore")} onPress={() => void restore()} loading={restoring} />
      <ButtonSecondary testID="paywall-close" label={t("common.close")} onPress={() => router.back()} />
    </Screen>
  );
}
