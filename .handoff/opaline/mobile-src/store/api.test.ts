import { jsonResponse } from "@/test-utils/render";
import { makeStore } from ".";
import { api } from "./api";
import { signedIn } from "./authSlice";

jest.mock("@/services/auth/tokenStorage", () => ({
  tokenStorage: { load: jest.fn(), save: jest.fn(), clear: jest.fn() },
}));

const fetchMock = jest.fn();
beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

const lastRequest = () => fetchMock.mock.calls.at(-1)![0] as Request;

describe("api", () => {
  it("sends the session token as a Bearer header", async () => {
    const store = makeStore();
    store.dispatch(signedIn({ token: "tok.sig", username: "anna" }));
    fetchMock.mockResolvedValue(jsonResponse([]));

    await store.dispatch(api.endpoints.getModels.initiate());
    expect(lastRequest().headers.get("Authorization")).toBe("Bearer tok.sig");
    expect(lastRequest().url).toMatch(/\/api\/models$/);
  });

  it("signs out when the server rejects the session", async () => {
    const store = makeStore();
    store.dispatch(signedIn({ token: "expired", username: "anna" }));
    fetchMock.mockResolvedValue(jsonResponse({ error: "Unauthorized" }, 401));

    await store.dispatch(api.endpoints.getBatches.initiate());
    expect(store.getState().auth).toEqual({ status: "signedOut", token: null, username: null });
  });

  it("reloads batches once a purchase removes the watermark", async () => {
    const store = makeStore();
    store.dispatch(signedIn({ token: "tok.sig", username: "anna" }));
    const credits = (watermark: boolean) => jsonResponse({ total: 50, available: 50, subscription: 0, purchased: 50, perImage: 10, watermark });
    fetchMock.mockResolvedValueOnce(credits(true)).mockResolvedValueOnce(jsonResponse([]));
    await store.dispatch(api.endpoints.getCredits.initiate());
    const batches = store.dispatch(api.endpoints.getBatches.initiate());
    await batches;

    fetchMock.mockResolvedValueOnce(credits(false)).mockResolvedValue(jsonResponse([]));
    await store.dispatch(api.endpoints.getCredits.initiate(undefined, { forceRefetch: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchMock.mock.calls.map(([request]) => new URL((request as Request).url).pathname)).toEqual([
      "/api/credits",
      "/api/batches",
      "/api/credits",
      "/api/batches",
    ]);
    batches.unsubscribe();
  });

  it("keeps the user signed out on a wrong password instead of looping", async () => {
    const store = makeStore();
    fetchMock.mockResolvedValue(jsonResponse({ error: "Wrong username or password" }, 401));

    const result = await store.dispatch(api.endpoints.login.initiate({ username: "anna", password: "x" }));
    expect(result.error).toMatchObject({ status: 401 });
    expect(store.getState().auth.status).toBe("restoring");
  });
});
