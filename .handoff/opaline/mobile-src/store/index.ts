import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { AppState } from "react-native";
import { useDispatch, useSelector, useStore } from "react-redux";
import { tokenStorage } from "@/services/auth/tokenStorage";
import { api } from "./api";
import { authSlice, signedIn, signedOut } from "./authSlice";
import { onboardingSlice } from "./onboardingSlice";
import { sessionSlice } from "./sessionSlice";

export function makeStore() {
  const store = configureStore({
    reducer: {
      auth: authSlice.reducer,
      onboarding: onboardingSlice.reducer,
      session: sessionSlice.reducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });

  // Keychain mirrors the auth state; signing out also drops every cached response.
  let lastAuth = store.getState().auth;
  store.subscribe(() => {
    const { auth } = store.getState();
    if (auth === lastAuth) return;
    lastAuth = auth;
    if (auth.status === "signedIn" && auth.token && auth.username) {
      void tokenStorage.save({ token: auth.token, username: auth.username });
    } else if (auth.status === "signedOut") {
      void tokenStorage.clear();
      store.dispatch(api.util.resetApiState());
    }
  });

  // Refetch on app foreground / reconnect (RTK Query's focus events, wired to AppState).
  setupListeners(store.dispatch, (dispatch, { onFocus, onFocusLost }) => {
    const sub = AppState.addEventListener("change", (state) => dispatch(state === "active" ? onFocus() : onFocusLost()));
    return () => sub.remove();
  });

  return store;
}

/** Restores the Keychain session on launch. */
export async function restoreSession(dispatch: AppDispatch) {
  const session = await tokenStorage.load();
  dispatch(session ? signedIn(session) : signedOut());
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
