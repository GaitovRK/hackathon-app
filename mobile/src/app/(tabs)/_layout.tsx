import { Tabs } from "expo-router";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("tabs.home") }} />
      <Tabs.Screen name="history" options={{ title: t("tabs.history") }} />
      <Tabs.Screen name="settings" options={{ title: t("tabs.settings") }} />
    </Tabs>
  );
}
