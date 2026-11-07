import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { mockOutfit } from "@/dev/previews";
import { makeStore, type AppStore } from "@/store";
import { api } from "@/store/api";
import { sessionReady } from "@/store/sessionSlice";
import TodayScreen from "./index";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() } }));

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

  it("switches occasion and refetches", async () => {
    renderToday();
    await waitFor(() => expect(screen.getByTestId("occasion-friends")).toBeTruthy(), { timeout: 5000 });
    fireEvent.press(screen.getByTestId("occasion-friends"));
    await waitFor(() => expect(calls.some((c) => c.includes("occasion=friends"))).toBe(true));
  });
});
