import { fireEvent, render, screen, waitFor, within } from "@testing-library/react-native";
import { router } from "expo-router";
import { Provider } from "react-redux";
import { closetMockItems } from "@/dev/previews";
import type { Item, MeResponse } from "@/services/api/types";
import { makeStore, type AppStore } from "@/store";
import { api } from "@/store/api";
import { sessionReady } from "@/store/sessionSlice";
import ClosetScreen from "@/app/(tabs)/closet";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() } }));

const json = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

let store: AppStore | null = null;
let items: Item[] = closetMockItems;
let me: MeResponse = { userId: "u1", isPro: false, freeLeftToday: 3, itemCount: closetMockItems.length, itemLimit: 50 };

const tileIds = () => within(screen.getByTestId("closet-grid")).getAllByRole("button").map((b) => b.props.testID as string);

async function renderCloset() {
  store = makeStore();
  store.dispatch(sessionReady({ token: "jwt", userId: "u1" }));
  await render(
    <Provider store={store}>
      <ClosetScreen />
    </Provider>,
  );
  await waitFor(() => expect(screen.getByTestId("closet-meter")).toBeTruthy(), { timeout: 5000 });
}

describe("ClosetScreen", () => {
  beforeEach(() => {
    items = closetMockItems;
    me = { userId: "u1", isPro: false, freeLeftToday: 3, itemCount: closetMockItems.length, itemLimit: 50 };
    globalThis.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.endsWith("/items")) return json(items);
      if (url.endsWith("/me")) return json(me);
      return json({}, 404);
    }) as unknown as typeof fetch;
  });
  afterEach(() => {
    store?.dispatch(api.util.resetApiState());
  });

  it("shows the Free meter, chip counts and every item, newest first", async () => {
    await renderCloset();
    expect(screen.getByText("14")).toBeTruthy();
    expect(screen.getByText("/ 50 items")).toBeTruthy();
    expect(screen.getByTestId("closet-chip-all-count")).toHaveTextContent("14");
    expect(screen.getByTestId("closet-chip-top-count")).toHaveTextContent("4");
    expect(screen.getByTestId("closet-chip-accessory-count")).toHaveTextContent("2");
    expect(screen.getByText("Bags & accessories")).toBeTruthy();
    expect(tileIds()).toHaveLength(14);
    expect(tileIds()[0]).toBe("item-i14");
    expect(screen.queryByTestId("closet-new-items")).toBeNull();
  });

  it("filters the grid by category chip", async () => {
    await renderCloset();
    await fireEvent.press(screen.getByTestId("closet-chip-shoes"));
    expect(tileIds().sort()).toEqual(["item-i11", "item-i3", "item-i8"].sort());
    expect(screen.getByTestId("closet-chip-shoes").props.accessibilityState).toMatchObject({ selected: true });
    await fireEvent.press(screen.getByTestId("closet-chip-all"));
    expect(tileIds()).toHaveLength(14);
  });

  it("searches by name, color and category, and updates chip counts", async () => {
    await renderCloset();
    await fireEvent.changeText(screen.getByTestId("closet-search"), "black");
    expect(tileIds().sort()).toEqual(["item-i10", "item-i11", "item-i6"].sort());
    expect(screen.getByTestId("closet-chip-all-count")).toHaveTextContent("3");
    expect(screen.getByTestId("closet-chip-shoes-count")).toHaveTextContent("1");

    await fireEvent.press(screen.getByTestId("closet-chip-bottom"));
    expect(tileIds()).toEqual(["item-i10"]);

    await fireEvent.changeText(screen.getByTestId("closet-search"), "zebra");
    expect(screen.queryByTestId("closet-grid")).toBeNull();
    expect(screen.getByText("Nothing matches. Try another word or category.")).toBeTruthy();
  });

  it("sorts by color", async () => {
    await renderCloset();
    await fireEvent.press(screen.getByTestId("closet-sort-toggle"));
    await fireEvent.press(screen.getByTestId("closet-sort-color"));
    expect(screen.getByText("By color")).toBeTruthy();
    // white first (oxford, striped shirt, sneakers by category then newest), purple-free closet ends with pink
    expect(tileIds()[0]).toBe("item-i5");
    expect(tileIds()[tileIds().length - 1]).toBe("item-i9");
  });

  it("opens the tag sheet when a tile is tapped", async () => {
    await renderCloset();
    await fireEvent.press(screen.getByTestId("item-i6"));
    expect(screen.getByText("Remove from closet")).toBeTruthy();
  });

  it("shows Unlimited for Pro", async () => {
    me = { ...me, isPro: true, itemLimit: null };
    await renderCloset();
    await waitFor(() => expect(screen.getByText(/Unlimited/)).toBeTruthy());
  });

  it("shows the empty state with Add basics opening the starter picker", async () => {
    items = [];
    me = { ...me, itemCount: 0 };
    await renderCloset();
    await waitFor(() => expect(screen.getByTestId("closet-empty")).toBeTruthy());
    await fireEvent.press(screen.getByTestId("closet-add-basics"));
    expect(router.push).toHaveBeenCalledWith({ pathname: "/onboarding/closet", params: { mode: "add" } });
  });
});
