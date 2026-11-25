import { PRODUCTION_API_URL, resolveApiUrl } from "./config";

describe("resolveApiUrl", () => {
  it("uses EXPO_PUBLIC_API_URL in dev builds, without a trailing slash", () => {
    expect(resolveApiUrl(true, "http://192.168.1.7:3000/")).toBe("http://192.168.1.7:3000");
  });

  it("falls back to localhost in dev builds without an env URL", () => {
    expect(resolveApiUrl(true, undefined)).toBe("http://localhost:3000");
  });

  it("always uses the production backend in release builds, even with a local env URL", () => {
    expect(resolveApiUrl(false, "http://192.168.1.7:3000")).toBe(PRODUCTION_API_URL);
    expect(PRODUCTION_API_URL).toMatch(/^https:\/\//);
  });
});
