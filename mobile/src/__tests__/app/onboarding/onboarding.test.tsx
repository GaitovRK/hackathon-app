import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { Provider } from "react-redux";
import { looksFor } from "@/content/looks";
import type { StarterItem } from "@/services/api/types";
import { makeStore, type AppStore } from "@/store";
import { api } from "@/store/api";
import { sessionReady } from "@/store/sessionSlice";
import StarterClosetScreen from "@/app/onboarding/closet";
import SwipeScreen from "@/app/onboarding/swipe";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({}) }));

const json = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

const starter = (starterKey: string, name: string, category: StarterItem["category"], subcategory: string): StarterItem => ({
  starterKey,
  name,
  category,
  subcategory,
  primaryColor: "navy",
  pattern: "solid",
  formality: 3,
  warmth: 2,
  seasons: [],
  occasions: ["work"],
  wardrobe: "both",
});

const CATALOG = [starter("white_shirt", "White shirt", "top", "shirt"), starter("navy_chinos", "Navy chinos", "bottom", "chinos"), starter("white_sneakers", "White sneakers", "shoes", "sneakers")];

let store: AppStore | null = null;

async function renderWith(ui: ReactElement) {
  store = makeStore();
  store.dispatch(sessionReady({ token: "jwt", userId: "u1" }));
  await render(<Provider store={store}>{ui}</Provider>);
  return store;
}

describe("onboarding", () => {
  afterEach(() => {
    store?.dispatch(api.util.resetApiState());
  });
  beforeEach(() => {
    globalThis.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.includes("/starter-catalog")) return json({ items: CATALOG, looks: [] });
      return json({}, 404);
    }) as unknown as typeof fetch;
  });

  it("swipe deck shows the n / total counter and the segmented bar, and advances on Very me / Not for me", async () => {
    const s = await renderWith(<SwipeScreen />);
    const total = looksFor(s.getState().onboarding.wardrobe).length;
    expect(screen.getByTestId("swipe-counter")).toHaveTextContent(`1 / ${total}`);
    expect(screen.getByTestId("swipe-progress")).toBeTruthy();
    expect(screen.getByText("Would you wear this to work?")).toBeTruthy();
    await fireEvent.press(screen.getByTestId("swipe-like"));
    expect(screen.getByTestId("swipe-counter")).toHaveTextContent(`2 / ${total}`);
    await fireEvent.press(screen.getByTestId("swipe-dislike"));
    expect(s.getState().onboarding.swipes.map((x) => x.liked)).toEqual([true, false]);
  });

  it("basics picker lists the catalog as pickable tiles and counts the picks on the build pill", async () => {
    await renderWith(<StarterClosetScreen />);
    await waitFor(() => expect(screen.getByTestId("starter-white_shirt")).toBeTruthy(), { timeout: 5000 });
    expect(screen.getByText("What's already in your closet?")).toBeTruthy();
    expect(screen.getByTestId("build-outfits")).toBeDisabled();
    await fireEvent.press(screen.getByTestId("starter-white_shirt"));
    await fireEvent.press(screen.getByTestId("starter-navy_chinos"));
    await fireEvent.press(screen.getByTestId("starter-white_sneakers"));
    expect(screen.getByTestId("starter-white_shirt").props.accessibilityState).toMatchObject({ selected: true });
    expect(screen.getByText("Build my outfits · 3")).toBeTruthy();
    expect(screen.getByTestId("build-outfits")).toBeEnabled();
  });

  it("basics picker filters by category", async () => {
    await renderWith(<StarterClosetScreen />);
    await waitFor(() => expect(screen.getByTestId("basics-filter-shoes")).toBeTruthy(), { timeout: 5000 });
    await fireEvent.press(screen.getByTestId("basics-filter-shoes"));
    expect(screen.queryByTestId("starter-white_shirt")).toBeNull();
    expect(screen.getByTestId("starter-white_sneakers")).toBeTruthy();
  });
});
