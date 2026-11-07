import { LOOKS, looksFor } from "@/content/looks";
import { WARDROBES } from "@/services/api/types";
import { initialOnboardingState } from "@/store/onboardingSlice";
import { defaultSelection, sortWomenswearFirst } from "./useStarterPicker";

describe("women-first onboarding (decision #2)", () => {
  it("lists womenswear first and pre-selects it", () => {
    expect(WARDROBES[0]).toBe("womenswear");
    expect(initialOnboardingState.wardrobe).toBe("womenswear");
  });

  it("sorts the picker womenswear, then unisex, then menswear, keeping the catalog order within each", () => {
    const items = [
      { starterKey: "oxfords", wardrobe: "menswear" as const },
      { starterKey: "tee", wardrobe: "both" as const },
      { starterKey: "skirt", wardrobe: "womenswear" as const },
      { starterKey: "jeans", wardrobe: "both" as const },
      { starterKey: "flats", wardrobe: "womenswear" as const },
    ];
    expect(sortWomenswearFirst(items).map((i) => i.starterKey)).toEqual(["skirt", "flats", "tee", "jeans", "oxfords"]);
    expect(items[0].starterKey).toBe("oxfords"); // input untouched
  });

  it("leads the deck with womenswear looks and still has menswear ones", () => {
    const women = LOOKS.filter((l) => l.wardrobe === "womenswear");
    expect(LOOKS).toHaveLength(20);
    expect(women.length).toBeGreaterThanOrEqual(13);
    expect(LOOKS.slice(0, women.length).every((l) => l.wardrobe === "womenswear")).toBe(true);
    expect(looksFor("womenswear").some((l) => l.wardrobe === "menswear")).toBe(false);
    expect(looksFor("menswear").length).toBeGreaterThan(0);
  });

  it("pre-selects the items of liked womenswear looks", () => {
    expect(defaultSelection(["look-breton-flats"], "womenswear")).toEqual(["breton-tee", "straight-jeans", "black-ballet-flats", "tan-leather-tote"]);
  });
});
