import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { setQuotaExceededHandler } from "@/services/api/quotaHandler";
import { bootstrapSession } from "@/services/session/bootstrap";
import { makeStore } from "@/store";

export default function RootLayout() {
  const [store] = useState(makeStore);

  useEffect(() => {
    setQuotaExceededHandler(() => router.push("/paywall"));
    void bootstrapSession(store.dispatch);
    return () => setQuotaExceededHandler(null);
  }, [store]);

  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
      </Stack>
    </Provider>
  );
}
