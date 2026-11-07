import * as SecureStore from "expo-secure-store";
import type { AuthResponse } from "@/services/api/types";

const KEY = "session.v1";

/** The anonymous session (JWT + user id) in the Keychain / Keystore. */
export const tokenStorage = {
  async load(): Promise<AuthResponse | null> {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<AuthResponse>;
      return parsed.token && parsed.userId ? { token: parsed.token, userId: parsed.userId } : null;
    } catch {
      return null;
    }
  },
  save: (session: AuthResponse) => SecureStore.setItemAsync(KEY, JSON.stringify(session)),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
