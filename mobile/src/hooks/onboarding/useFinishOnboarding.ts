import { router } from "expo-router";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useAddStarterItemsMutation, useAddSwipesMutation, useUpdateStyleProfileMutation } from "@/store/api";
import { onboardingReset, stepChanged } from "@/store/onboardingSlice";

/**
 * Sends the onboarding to the server: swipes, profile (onboarded) and the starter closet, then goes to Today.
 * `mode: "add"` (from the Closet tab) only adds the selected starters and returns.
 */
export function useFinishOnboarding(mode: "onboard" | "add" = "onboard") {
  const dispatch = useAppDispatch();
  const { swipes, dressCode, city, wardrobe, selectedStarterKeys } = useAppSelector((s) => s.onboarding);
  const [addSwipes] = useAddSwipesMutation();
  const [updateProfile] = useUpdateStyleProfileMutation();
  const [addStarters] = useAddStarterItemsMutation();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const finish = async () => {
    setBusy(true);
    setFailed(false);
    try {
      if (mode === "onboard") {
        if (swipes.length) await addSwipes(swipes).unwrap();
        await updateProfile({ dressCode, city: city.trim() || null, wardrobe, onboarded: true }).unwrap();
      }
      if (selectedStarterKeys.length) await addStarters(selectedStarterKeys).unwrap();
      if (mode === "onboard") {
        dispatch(stepChanged("done"));
        router.replace("/(tabs)");
      } else {
        dispatch(onboardingReset());
        router.back();
      }
    } catch (e) {
      // A 402 ITEM_LIMIT already opened the paywall; everything else is a retryable failure.
      if ((e as { status?: unknown })?.status !== 402) setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return { finish, busy, failed };
}
