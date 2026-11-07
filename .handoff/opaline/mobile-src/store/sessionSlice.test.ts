import { jsonResponse } from "@/test-utils/render";
import { api } from "./api";
import { makeStore } from "./index";

jest.mock("@/services/auth/tokenStorage", () => ({
  tokenStorage: { load: jest.fn(), save: jest.fn(), clear: jest.fn() },
}));

const fetchMock = jest.fn();
beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

describe("session error flag", () => {
  it("starts clean and stays clean on success", async () => {
    const store = makeStore();
    fetchMock.mockResolvedValue(jsonResponse([]));
    await store.dispatch(api.endpoints.getModels.initiate());
    expect(store.getState().session.hadError).toBe(false);
  });

  it("is set by a 402", async () => {
    const store = makeStore();
    fetchMock.mockResolvedValue(jsonResponse({ error: "insufficient_credits" }, 402));
    await store.dispatch(api.endpoints.createBatch.initiate({} as never));
    expect(store.getState().session.hadError).toBe(true);
  });

  it("ignores a 401 (expired session)", async () => {
    const store = makeStore();
    fetchMock.mockResolvedValue(jsonResponse({ error: "unauthorized" }, 401));
    await store.dispatch(api.endpoints.getModels.initiate());
    expect(store.getState().session.hadError).toBe(false);
  });
});
