import { canBuildOutfit, defaultSelection } from "@/hooks/onboarding/useStarterPicker";
import type { StarterItem } from "@/services/api/types";
import { answersChanged, initialOnboardingState, lookSwiped, onboardingReset, onboardingSlice, selectLikedCount, starterToggled, startersSelected } from "./onboardingSlice";

const reduce = onboardingSlice.reducer;

describe("onboardingSlice", () => {
  it("records swipes, advances the deck and overwrites a re-swipe", () => {
    let s = reduce(initialOnboardingState, lookSwiped({ lookId: "a", liked: true }));
    s = reduce(s, lookSwiped({ lookId: "b", liked: false }));
    s = reduce(s, lookSwiped({ lookId: "a", liked: false }));
    expect(s.swipes).toEqual([
      { lookId: "a", liked: false },
      { lookId: "b", liked: false },
    ]);
    expect(s.deckIndex).toBe(3);
    expect(selectLikedCount({ onboarding: s })).toBe(0);
  });

  it("stores the three answers", () => {
    const s = reduce(initialOnboardingState, answersChanged({ dressCode: "formal", city: "Istanbul", wardrobe: "menswear" }));
    expect(s).toMatchObject({ dressCode: "formal", city: "Istanbul", wardrobe: "menswear" });
  });

  it("toggles starter keys and resets", () => {
    let s = reduce(initialOnboardingState, startersSelected(["a", "b", "a"]));
    expect(s.selectedStarterKeys).toEqual(["a", "b"]);
    s = reduce(s, starterToggled("b"));
    s = reduce(s, starterToggled("c"));
    expect(s.selectedStarterKeys).toEqual(["a", "c"]);
    expect(reduce(s, onboardingReset())).toEqual(initialOnboardingState);
  });
});

describe("starter picker helpers", () => {
  const starter = (starterKey: string, category: StarterItem["category"]): StarterItem => ({
    starterKey,
    name: starterKey,
    category,
    subcategory: "x",
    primaryColor: "navy",
    pattern: "solid",
    formality: 3,
    warmth: 2,
    seasons: [],
    occasions: [],
    wardrobe: "both",
  });
  const catalog = [starter("shirt", "top"), starter("chinos", "bottom"), starter("loafers", "shoes"), starter("dress", "dress")];

  it("needs top + bottom + shoes, or dress + shoes", () => {
    expect(canBuildOutfit(["shirt", "chinos"], catalog)).toBe(false);
    expect(canBuildOutfit(["shirt", "chinos", "loafers"], catalog)).toBe(true);
    expect(canBuildOutfit(["dress", "loafers"], catalog)).toBe(true);
    expect(canBuildOutfit(["dress"], catalog)).toBe(false);
  });

  it("pre-selects the items of liked looks for the wardrobe", () => {
    const keys = defaultSelection(["look-office-classic", "look-midi"], "menswear");
    expect(keys).toEqual(expect.arrayContaining(["white-oxford-shirt", "navy-chinos", "brown-loafers", "navy-blazer"]));
    expect(keys).not.toContain("black-midi-dress"); // womenswear look is not in a menswear deck
    expect(defaultSelection([], "both")).toEqual([]);
  });
});
