import { createSlice, isRejectedWithValue } from "@reduxjs/toolkit";

type SessionState = { hadError: boolean };

const initialState: SessionState = { hadError: false };

const status = (payload: unknown) => (payload as { status?: unknown } | undefined)?.status;

/** What happened since the app launched. `hadError` (a failed request, a 402, a failed save) keeps the rating prompt away. */
export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    errorOccurred: (state) => {
      state.hadError = true;
    },
  },
  extraReducers: (builder) => {
    // Every failed API call (402 included); a 401 is just an expired session and signs out on its own.
    builder.addMatcher(isRejectedWithValue, (state, action) => {
      if (status(action.payload) !== 401) state.hadError = true;
    });
  },
});

export const { errorOccurred } = sessionSlice.actions;
