import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { AppState } from "react-native";
import { useDispatch, useSelector, useStore } from "react-redux";
import { api } from "./api";
import { ideasSlice } from "./ideasSlice";
import { onboardingSlice } from "./onboardingSlice";
import { sessionSlice } from "./sessionSlice";

export function makeStore() {
  const store = configureStore({
    reducer: {
      session: sessionSlice.reducer,
      onboarding: onboardingSlice.reducer,
      ideas: ideasSlice.reducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });

  // Refetch on app foreground (RTK Query focus events wired to AppState).
  setupListeners(store.dispatch, (dispatch, { onFocus, onFocusLost }) => {
    const sub = AppState.addEventListener("change", (state) => dispatch(state === "active" ? onFocus() : onFocusLost()));
    return () => sub.remove();
  });

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
