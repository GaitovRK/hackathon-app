import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IdeasRequest, IdeasResponse, Outfit } from "@/services/api/types";

/**
 * The current ideas session (board 05 → 06 → 07): the brief, the last result, the liked keys and which
 * keys are already saved (key → outfit id). Ideas live only here until the user saves them.
 */
export type IdeasState = {
  brief: IdeasRequest | null;
  result: IdeasResponse | null;
  selected: string[];
  savedIds: Record<string, string>;
};

const initialState: IdeasState = { brief: null, result: null, selected: [], savedIds: {} };

export const ideasSlice = createSlice({
  name: "ideas",
  initialState,
  reducers: {
    ideasReceived(state, action: PayloadAction<{ brief: IdeasRequest; result: IdeasResponse }>) {
      state.brief = action.payload.brief;
      state.result = action.payload.result;
      state.selected = [];
      state.savedIds = {};
    },
    ideaToggled(state, action: PayloadAction<string>) {
      const key = action.payload;
      state.selected = state.selected.includes(key) ? state.selected.filter((k) => k !== key) : [...state.selected, key];
    },
    ideasSaved(state, action: PayloadAction<{ keys: string[]; outfits: Outfit[] }>) {
      action.payload.keys.forEach((key, i) => {
        const outfit = action.payload.outfits[i];
        if (outfit) state.savedIds[key] = outfit.id;
      });
      state.selected = state.selected.filter((k) => !(k in state.savedIds));
    },
    ideasCleared: () => initialState,
  },
});

export const { ideasReceived, ideaToggled, ideasSaved, ideasCleared } = ideasSlice.actions;
