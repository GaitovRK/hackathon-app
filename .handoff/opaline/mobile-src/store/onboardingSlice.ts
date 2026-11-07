import { createSlice } from "@reduxjs/toolkit";
import { signedIn } from "./authSlice";

/**
 * `pending`: show the onboarding slides before the login screen (first launch of this install).
 * `usernameForm`: the slides were left with "Sign in with a username", so the login screen opens that form right away.
 */
type OnboardingState = { pending: boolean; usernameForm: boolean };

const initialState: OnboardingState = { pending: false, usernameForm: false };

export const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    onboardingRequired: (): OnboardingState => ({ pending: true, usernameForm: false }),
    /** "Sign in with a username" on the last slide: on to the login screen, form open. */
    onboardingFinished: (): OnboardingState => ({ pending: false, usernameForm: true }),
  },
  // Signing in (or a restored session) ends it: signing out later lands on the login screen, form closed.
  extraReducers: (builder) => builder.addCase(signedIn, (): OnboardingState => ({ pending: false, usernameForm: false })),
});

export const { onboardingRequired, onboardingFinished } = onboardingSlice.actions;
