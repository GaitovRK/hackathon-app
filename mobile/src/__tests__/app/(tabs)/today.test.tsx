import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { mockOutfit } from "@/dev/previews";
import { makeStore, type AppStore } from "@/store";
import { api } from "@/store/api";
import { sessionReady } from "@/store/sessionSlice";
import TodayScreen from "@/app/(tabs)/index";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() } }));
jest.mock("@/services/purchases/presentPaywall", () => ({ presentPaywall: jest.fn(async () => false), setPaywallUnlockedHandler: jest.fn() }));

const { router } = jest.requireMock("expo-router") as { router: { push: jest.Mock } };
const { presentPaywall } = jest.requireMock("@/services/purchases/presentPaywall") as { presentPaywall: jest.Mock };

const json = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

let store: AppStore | null = null;

function renderToday() {
  store = makeStore();
  store.dispatch(sessionReady({ token: "jwt", userId: "u1" }));
  render(
    <Provider store={store}>
      <TodayScreen />
    </Provider>,
  );
  return store;
}

describe("TodayScreen", () => {
  const calls: string[] = [];
  afterEach(() => {
    store?.dispatch(api.util.resetApiState()); // drop cache timers so the worker exits cleanly
  });
  beforeEach(() => {
    calls.length = 0;
    globalThis.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input instanceof Request ? input.url : input);
      const method = input instanceof Request ? input.method : (init?.method ?? "GET");
      calls.push(`${method} ${url}`);
      if (url.includes("/outfits/today")) {
        return json({ date: "2026-11-07", occasion: "work", refreshesLeft: 1, closetTooSmall: false, outfits: [mockOutfit, { ...mockOutfit, id: "o2" }, { ...mockOutfit, id: "o3" }] });
      }
      if (url.endsWith("/me")) return json({ userId: "u1", isPro: false, freeLeftToday: 1, itemCount: 8, itemLimit: 50 });
      if (url.endsWith("/items")) return json([]);
      if (url.includes("/save")) return json({ ...mockOutfit, status: "saved" });
      if (url.includes("/wear")) return json({ ...mockOutfit, status: "worn" });
      if (url.includes("/feedback")) return json({ ok: true });
      return json({}, 404);
    }) as unknown as typeof fetch;
  });

  it("loads today's 3 outfits for work with their reasons and actions", async () => {
    renderToday();
    await waitFor(() => expect(screen.getByTestId("outfit-o1")).toBeTruthy(), { timeout: 5000 });
    expect(screen.getByTestId("outfit-o2")).toBeTruthy();
    expect(screen.getByTestId("outfit-o3")).toBeTruthy();
    expect(screen.getAllByText(mockOutfit.reason)).toHaveLength(3);
    expect(calls[0]).toMatch(/GET .*\/outfits\/today\?occasion=work&date=\d{4}-\d{2}-\d{2}$/);
    expect(screen.getByText("1 free refresh left today")).toBeTruthy();
  });

  it("marks an outfit as worn and sends feedback", async () => {
    renderToday();
    await waitFor(() => expect(screen.getByTestId("wear-o1")).toBeTruthy(), { timeout: 5000 });
    fireEvent.press(screen.getByTestId("wear-o1"));
    await waitFor(() => expect(calls.some((c) => /POST .*\/outfits\/o1\/wear$/.test(c))).toBe(true));
    fireEvent.press(screen.getByTestId("like-o2"));
    await waitFor(() => expect(calls.some((c) => /POST .*\/outfits\/o2\/feedback$/.test(c))).toBe(true));
  });

  it("shows the Work-first chips, outfit badges and the setup checklist", async () => {
    renderToday();
    await waitFor(() => expect(screen.getByTestId("outfit-o1")).toBeTruthy(), { timeout: 5000 });
    expect(screen.getByTestId("occasion-work").props.accessibilityState).toMatchObject({ selected: true });
    expect(screen.getByText("01 · Work")).toBeTruthy();
    expect(screen.getByText("03 · Work")).toBeTruthy();
    expect(screen.getByText("Today's 3")).toBeTruthy();
    expect(screen.getByTestId("setup-checklist")).toBeTruthy();
    expect(screen.getByText("2/4")).toBeTruthy();
    expect(screen.getByText("Add 3 photos of your own")).toBeTruthy();
  });

  it("opens the RevenueCat dashboard paywall from the Try Pro pill (no custom paywall screen)", async () => {
    renderToday();
    await waitFor(() => expect(screen.getByTestId("try-pro")).toBeTruthy(), { timeout: 5000 });
    fireEvent.press(screen.getByTestId("try-pro"));
    expect(presentPaywall).toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalledWith(expect.objectContaining({ pathname: "/paywall" }));
  });

  it("saves, dislikes, and reaches Settings from the header", async () => {
    renderToday();
    await waitFor(() => expect(screen.getByTestId("save-o1")).toBeTruthy(), { timeout: 5000 });
    fireEvent.press(screen.getByTestId("save-o1"));
    await waitFor(() => expect(calls.some((c) => /POST .*\/outfits\/o1\/save$/.test(c))).toBe(true));
    fireEvent.press(screen.getByTestId("dislike-o3"));
    await waitFor(() => expect(calls.some((c) => /POST .*\/outfits\/o3\/feedback$/.test(c))).toBe(true));
    fireEvent.press(screen.getByTestId("open-settings"));
    expect(router.push).toHaveBeenCalledWith("/settings");
  });

  it("switches occasion and refetches", async () => {
    renderToday();
    await waitFor(() => expect(screen.getByTestId("occasion-friends")).toBeTruthy(), { timeout: 5000 });
    fireEvent.press(screen.getByTestId("occasion-friends"));
    await waitFor(() => expect(calls.some((c) => c.includes("occasion=friends"))).toBe(true));
  });
});
