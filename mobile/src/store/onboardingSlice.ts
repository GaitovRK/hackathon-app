import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DressCode, StyleSwipe, Wardrobe } from "@/services/api/types";

export type OnboardingStep = "welcome" | "swipe" | "questions" | "closet" | "done";

export type OnboardingState = {
  step: OnboardingStep;
  /** Index of the next look to show in the deck. */
  deckIndex: number;
  swipes: StyleSwipe[];
  dressCode: DressCode;
  city: string;
  wardrobe: Wardrobe;
  /** Starter keys the user tapped in the closet picker. */
  selectedStarterKeys: string[];
  /** The "first wow" paywall is shown once, after the first outfits render. */
  firstWowShown: boolean;
};

export const initialOnboardingState: OnboardingState = {
  step: "welcome",
  deckIndex: 0,
  swipes: [],
  dressCode: "smart_casual",
  city: "",
  wardrobe: "both",
  selectedStarterKeys: [],
  firstWowShown: false,
};

export const onboardingSlice = createSlice({
  name: "onboarding",
  initialState: initialOnboardingState,
  reducers: {
    stepChanged: (state, action: PayloadAction<OnboardingStep>) => {
      state.step = action.payload;
    },
    lookSwiped: (state, action: PayloadAction<StyleSwipe>) => {
      const i = state.swipes.findIndex((s) => s.lookId === action.payload.lookId);
      if (i >= 0) state.swipes[i] = action.payload;
      else state.swipes.push(action.payload);
      state.deckIndex += 1;
    },
    answersChanged: (state, action: PayloadAction<Partial<Pick<OnboardingState, "dressCode" | "city" | "wardrobe">>>) => {
      Object.assign(state, action.payload);
    },
    starterToggled: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      const i = state.selectedStarterKeys.indexOf(key);
      if (i >= 0) state.selectedStarterKeys.splice(i, 1);
      else state.selectedStarterKeys.push(key);
    },
    startersSelected: (state, action: PayloadAction<string[]>) => {
      state.selectedStarterKeys = [...new Set(action.payload)];
    },
    firstWowShown: (state) => {
      state.firstWowShown = true;
    },
    onboardingReset: () => initialOnboardingState,
  },
});

export const { stepChanged, lookSwiped, answersChanged, starterToggled, startersSelected, firstWowShown, onboardingReset } = onboardingSlice.actions;

export const selectLikedCount = (s: { onboarding: OnboardingState }) => s.onboarding.swipes.filter((x) => x.liked).length;
