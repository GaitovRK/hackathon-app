import { resolveRevenueCatKey } from "./revenueCat";

describe("resolveRevenueCatKey", () => {
  it("is off without a key", () => {
    expect(resolveRevenueCatKey(true, undefined)).toBeUndefined();
    expect(resolveRevenueCatKey(false, "")).toBeUndefined();
  });

  it("allows a Test Store key in dev builds", () => {
    expect(resolveRevenueCatKey(true, "test_abc")).toBe("test_abc");
  });

  it("drops a Test Store key in release builds instead of shipping it", () => {
    expect(resolveRevenueCatKey(false, "test_abc")).toBeUndefined();
  });

  it("uses the App Store key in release builds", () => {
    expect(resolveRevenueCatKey(false, "appl_abc")).toBe("appl_abc");
  });
});
