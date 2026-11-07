import { Redirect, Tabs } from "expo-router";
import { Screen } from "@/components/Layout/Screen";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { t } from "@/i18n/t";
import { useAppSelector } from "@/store";
import { useStyleProfileQuery } from "@/store/api";
import { useTheme } from "@/theme/useTheme";

/** Tabs for onboarded users; a profile without `onboardedAt` goes to the onboarding flow first. */
export default function TabsLayout() {
  const { colors } = useTheme();
  const ready = useAppSelector((s) => s.session.status === "ready");
  const profile = useStyleProfileQuery(undefined, { skip: !ready });

  if (profile.data && !profile.data.onboardedAt) return <Redirect href="/onboarding" />;
  if (!profile.data && !profile.isError) {
    return (
      <Screen>
        <StatusMessage kind="loading" message={t("status.loading")} />
      </Screen>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("tabs.today") }} />
      <Tabs.Screen name="closet" options={{ title: t("tabs.closet") }} />
      <Tabs.Screen name="settings" options={{ title: t("tabs.settings") }} />
    </Tabs>
  );
}
