import { Stack } from "expo-router";
import { useTheme } from "@/theme/useTheme";

/** Onboarding: welcome → swipe deck → three questions → starter closet. `closet` is also reused from the Closet tab (`mode=add`). */
export default function OnboardingLayout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="swipe" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="closet" />
    </Stack>
  );
}
