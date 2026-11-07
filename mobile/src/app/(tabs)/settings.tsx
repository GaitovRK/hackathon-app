import Constants from "expo-constants";
import { Text } from "react-native";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { Screen } from "@/components/Layout/Screen";
import { useRestorePurchases } from "@/hooks/purchases/useRestorePurchases";
import { t } from "@/i18n/t";
import { useAppSelector } from "@/store";
import { useMeQuery } from "@/store/api";
import { useTheme } from "@/theme/useTheme";

export default function SettingsScreen() {
  const { colors, fontSize, fontFamily } = useTheme();
  const userId = useAppSelector((s) => s.session.userId);
  const ready = useAppSelector((s) => s.session.status === "ready");
  const me = useMeQuery(undefined, { skip: !ready });
  const { restore, restoring } = useRestorePurchases();
  const row = { color: colors.muted, fontSize: fontSize.sm, fontFamily: fontFamily.body };

  return (
    <Screen title={t("settings.title")}>
      <ButtonSecondary testID="restore-button" label={t("settings.restore")} onPress={() => void restore()} loading={restoring} />
      {me.data ? <Text style={row}>{me.data.isPro ? t("settings.pro") : t("settings.free")}</Text> : null}
      <Text style={row} selectable>
        {t("settings.userId")}: {userId ?? "—"}
      </Text>
      <Text style={row}>
        {t("settings.version")}: {Constants.expoConfig?.version ?? "—"}
      </Text>
    </Screen>
  );
}
