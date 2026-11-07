import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StoredSession } from "@/services/auth/tokenStorage";

type AuthState = { status: "restoring" | "signedOut" | "signedIn"; token: string | null; username: string | null };

const initialState: AuthState = { status: "restoring", token: null, username: null };

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signedIn: (_state, action: PayloadAction<StoredSession>): AuthState => ({ status: "signedIn", ...action.payload }),
    signedOut: (): AuthState => ({ status: "signedOut", token: null, username: null }),
  },
});

export const { signedIn, signedOut } = authSlice.actions;
