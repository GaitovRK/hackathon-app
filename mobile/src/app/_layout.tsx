import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { setQuotaExceededHandler } from "@/services/api/quotaHandler";
import { openPaywallScreen } from "@/services/purchases/paywallRoute";
import { bootstrapSession } from "@/services/session/bootstrap";
import { makeStore } from "@/store";
import { useAppFonts } from "@/theme/useAppFonts";
import { useTheme } from "@/theme/useTheme";

export default function RootLayout() {
  const [store] = useState(makeStore);
  const fontsReady = useAppFonts();
  const { colors } = useTheme();

  useEffect(() => {
    setQuotaExceededHandler((code) => openPaywallScreen(code));
    void bootstrapSession(store.dispatch);
    return () => setQuotaExceededHandler(null);
  }, [store]);

  if (!fontsReady) return null;

  return (
    <Provider store={store}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
      </Stack>
    </Provider>
  );
}
