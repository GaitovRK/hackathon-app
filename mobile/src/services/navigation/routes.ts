import { router } from "expo-router";

/** The starter basics picker (still reachable from the add-photo screen and empty states). */
export const openAddItems = () => router.push({ pathname: "/onboarding/closet", params: { mode: "add" } });

/** Settings (Restore Purchases lives there), opened from the Today header. */
export const openSettings = () => router.push("/settings");

/** Add your own clothes from a photo (#21): the tab bar centre +, Today checklist, Dress me banner, Closet. */
export const openAddPhoto = () => router.push("/add-photo");
