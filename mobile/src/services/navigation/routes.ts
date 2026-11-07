import { router } from "expo-router";

/** The center + in the tab bar: the add-items entry (the starter basics picker for now). */
export const openAddItems = () => router.push({ pathname: "/onboarding/closet", params: { mode: "add" } });

/** Settings (Restore Purchases lives there), opened from the Today header. */
export const openSettings = () => router.push("/settings");
