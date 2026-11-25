import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { bootstrapSession } from "@/services/session/bootstrap";
import { makeStore, type AppStore } from "@/store";
import { api } from "@/store/api";
import TabsLayout from "@/app/(tabs)/_layout";

jest.mock("expo-router", () => {
  const { Text: RNText } = jest.requireActual("react-native");
  function Tabs() {
    return <RNText>tabs</RNText>;
  }
  Tabs.Screen = function Screen() {
    return null;
  };
  function Redirect() {
    return <RNText>redirect</RNText>;
  }
  return { Tabs, Redirect, router: { push: jest.fn() } };
});

const json = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

let store: AppStore | null = null;
let serverUp = false;

describe("TabsLayout", () => {
  beforeEach(() => {
    serverUp = false;
    globalThis.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (!serverUp) return json({ message: "not found" }, 404);
      if (url.endsWith("/auth/anonymous")) return json({ token: "jwt", userId: "u1" });
      if (url.endsWith("/style-profile")) return json({ onboardedAt: "2026-11-25T00:00:00.000Z" });
      return json({}, 404);
    }) as unknown as typeof fetch;
  });
  afterEach(() => {
    store?.dispatch(api.util.resetApiState());
  });

  it("shows an error with Try again when the first sign-in fails, then recovers", async () => {
    store = makeStore();
    await bootstrapSession(store.dispatch);
    expect(store.getState().session.status).toBe("error");

    await render(
      <Provider store={store}>
        <TabsLayout />
      </Provider>,
    );
    expect(screen.getByText("Can't reach Flick right now. Check your connection and try again.")).toBeTruthy();
    expect(screen.queryByText("Loading…")).toBeNull();

    serverUp = true;
    fireEvent.press(screen.getByTestId("session-retry"));
    await waitFor(() => expect(screen.getByText("tabs")).toBeTruthy(), { timeout: 5000 });
    expect(store.getState().session.status).toBe("ready");
  });
});
