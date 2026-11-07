import * as SecureStore from "expo-secure-store";

/** Small persisted booleans (e.g. "first wow paywall shown"); SecureStore is already the app's storage. */
export const flagStorage = {
  async get(key: string): Promise<boolean> {
    return (await SecureStore.getItemAsync(`flag.${key}`).catch(() => null)) === "1";
  },
  async set(key: string): Promise<void> {
    await SecureStore.setItemAsync(`flag.${key}`, "1").catch(() => undefined);
  },
};

export const FIRST_WOW_FLAG = "firstWow.v1";
