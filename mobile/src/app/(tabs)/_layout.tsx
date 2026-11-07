import { Redirect, Tabs } from "expo-router";
import { Screen } from "@/components/Layout/Screen";
import { TabBar, type TabItem } from "@/components/Navigation/TabBar";
import { StatusMessage } from "@/components/Status/StatusMessage";
import { openAddItems } from "@/services/navigation/routes";
import { t } from "@/i18n/t";
import { useAppSelector } from "@/store";
import { useStyleProfileQuery } from "@/store/api";

/** Tabs in the bar (board: Today, +, Closet). Settings stays a tab route but is opened from the Today header. */
const BAR_TABS: TabItem[] = [
  { name: "index", label: t("tabs.today"), icon: "sun" },
  { name: "closet", label: t("tabs.closet"), icon: "hanger" },
];

/** Tabs for onboarded users; a profile without `onboardedAt` goes to the onboarding flow first. */
export default function TabsLayout() {
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
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <TabBar
          tabs={BAR_TABS}
          active={state.routes[state.index]?.name ?? "index"}
          onTab={(name) => navigation.navigate(name)}
          onAdd={openAddItems}
          addLabel={t("home.addItems")}
        />
      )}
    >
      <Tabs.Screen name="index" options={{ title: t("tabs.today") }} />
      <Tabs.Screen name="closet" options={{ title: t("tabs.closet") }} />
      <Tabs.Screen name="settings" options={{ title: t("tabs.settings") }} />
    </Tabs>
  );
}
