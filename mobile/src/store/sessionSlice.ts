import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthResponse } from "@/services/api/types";

export type SessionStatus = "idle" | "loading" | "ready" | "error";

export type SessionState = { token: string | null; userId: string | null; status: SessionStatus };

const initialState: SessionState = { token: null, userId: null, status: "idle" };

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    sessionLoading: (state) => {
      state.status = "loading";
    },
    sessionReady: (state, action: PayloadAction<AuthResponse>) => {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.status = "ready";
    },
    sessionFailed: (state) => {
      state.status = "error";
    },
    sessionCleared: () => initialState,
  },
});

export const { sessionLoading, sessionReady, sessionFailed, sessionCleared } = sessionSlice.actions;
