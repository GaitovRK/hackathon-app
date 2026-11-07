import * as SecureStore from "expo-secure-store";

/** Keychain keys allow only letters, digits and `._-`. */
const keyFor = (username: string) => `softPaywallShownAt.${username.replace(/[^A-Za-z0-9._-]/g, "_")}`;

/** Remembers, per user on this device, that the soft paywall after the first result was shown (it shows once). */
export const softPaywallStorage = {
  async wasShown(username: string) {
    try {
      return (await SecureStore.getItemAsync(keyFor(username))) !== null;
    } catch {
      return true; // unreadable keychain: rather skip the sheet than show it twice
    }
  },
  markShown: (username: string) => SecureStore.setItemAsync(keyFor(username), new Date().toISOString()).catch(() => {}),
};
