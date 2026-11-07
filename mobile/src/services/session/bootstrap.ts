import { configurePurchases } from "@/services/purchases/revenueCat";
import type { AppDispatch } from "@/store";
import { api } from "@/store/api";
import { sessionFailed, sessionLoading, sessionReady } from "@/store/sessionSlice";
import { tokenStorage } from "./tokenStorage";

/**
 * Launch: JWT from secure storage, or a new anonymous session (saved for next time);
 * then RevenueCat is configured with our user id (skipped without a key).
 */
export async function bootstrapSession(dispatch: AppDispatch) {
  dispatch(sessionLoading());
  try {
    let session = await tokenStorage.load();
    if (!session) {
      session = await dispatch(api.endpoints.authAnonymous.initiate()).unwrap();
      await tokenStorage.save(session);
    }
    dispatch(sessionReady(session));
    await configurePurchases(session.userId).catch(() => undefined);
  } catch {
    dispatch(sessionFailed());
  }
}
