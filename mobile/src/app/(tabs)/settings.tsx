import Constants from "expo-constants";
import { Text } from "react-native";
import { ButtonSecondary } from "@/components/Buttons/ButtonSecondary";
import { Screen } from "@/components/Layout/Screen";
import { useRestorePurchases } from "@/hooks/purchases/useRestorePurchases";
import { t } from "@/i18n/t";
import { useAppSelector } from "@/store";
import { useTheme } from "@/theme/useTheme";

export default function SettingsScreen() {
  const { colors, fontSize } = useTheme();
  const userId = useAppSelector((s) => s.session.userId);
  const { restore, restoring } = useRestorePurchases();
  const row = { color: colors.muted, fontSize: fontSize.sm };

  return (
    <Screen title={t("settings.title")}>
      <ButtonSecondary testID="restore-button" label={t("settings.restore")} onPress={() => void restore()} loading={restoring} />
      <Text style={row} selectable>
        {t("settings.userId")}: {userId ?? "—"}
      </Text>
      <Text style={row}>
        {t("settings.version")}: {Constants.expoConfig?.version ?? "—"}
      </Text>
    </Screen>
  );
}
