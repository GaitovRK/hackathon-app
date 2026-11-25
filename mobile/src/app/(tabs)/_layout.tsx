import { Redirect, Tabs } from "expo-router";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { Screen } from "@/components/Layout/Screen";
import { TabBar, type TabItem } from "@/components/Navigation/TabBar";
import { StatusMessage } from "@/components/Status/StatusMessage";
import type { AddAction } from "@/components/Navigation/AddMenu";
import { openAddPhoto, openDressMe } from "@/services/navigation/routes";
import { t } from "@/i18n/t";
import { bootstrapSession } from "@/services/session/bootstrap";
import { useAppDispatch, useAppSelector } from "@/store";
import { useStyleProfileQuery } from "@/store/api";

/** Tabs in the bar (board: Today, +, Closet). Settings stays a tab route but is opened from the Today header. */
const BAR_TABS: TabItem[] = [
  { name: "index", label: t("tabs.today"), icon: "sun" },
  { name: "closet", label: t("tabs.closet"), icon: "hanger" },
];

/** The bubble the centre + opens (#33). */
const ADD_ACTIONS: AddAction[] = [
  { key: "upload", label: t("addMenu.upload"), hint: t("addMenu.uploadHint"), icon: "camera", onPress: openAddPhoto },
  { key: "outfit", label: t("addMenu.outfit"), hint: t("addMenu.outfitHint"), icon: "hanger", onPress: openDressMe },
];

/** Tabs for onboarded users; a profile without `onboardedAt` goes to the onboarding flow first. */
export default function TabsLayout() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.session.status);
  const profile = useStyleProfileQuery(undefined, { skip: status !== "ready" });

  // No session (server unreachable at launch): say so and let the user retry, instead of loading forever.
  if (status === "error") {
    return (
      <Screen>
        <StatusMessage kind="error" message={t("status.offline")} />
        <ButtonPrimary label={t("status.retry")} onPress={() => void bootstrapSession(dispatch)} testID="session-retry" />
      </Screen>
    );
  }
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
          addActions={ADD_ACTIONS}
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
