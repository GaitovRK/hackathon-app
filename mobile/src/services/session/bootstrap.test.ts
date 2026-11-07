import * as SecureStore from "expo-secure-store";
import { makeStore } from "@/store";
import { bootstrapSession } from "./bootstrap";

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

describe("bootstrapSession", () => {
  beforeAll(() => jest.useFakeTimers());
  afterAll(() => jest.useRealTimers());
  beforeEach(() => {
    globalThis.fetch = jest.fn(() => json({ token: "jwt-1", userId: "user-1" })) as unknown as typeof fetch;
  });

  it("signs in anonymously on first launch and stores the session", async () => {
    const store = makeStore();
    await bootstrapSession(store.dispatch);

    expect(store.getState().session).toEqual({ token: "jwt-1", userId: "user-1", status: "ready" });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
  });

  it("reuses the stored session on the next launch", async () => {
    const store = makeStore();
    await bootstrapSession(store.dispatch);

    expect(store.getState().session.userId).toBe("user-1");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("marks the session failed when the server is unreachable", async () => {
    await SecureStore.deleteItemAsync("session.v1");
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    globalThis.fetch = jest.fn(() => json({ message: "down" }, 500)) as unknown as typeof fetch;
    const store = makeStore();
    await bootstrapSession(store.dispatch);

    expect(store.getState().session.status).toBe("error");
  });
});
