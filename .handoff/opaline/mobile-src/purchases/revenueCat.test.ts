const ENV = { ...process.env };

// `process.env.X = undefined` would store the string "undefined".
function setEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

/** The key is read when the module loads, so each case loads it fresh (with its own react-native to fake the platform on). */
function load(os: "ios" | "android", keys: { ios?: string; android?: string }) {
  setEnv("EXPO_PUBLIC_REVENUECAT_IOS_KEY", keys.ios);
  setEnv("EXPO_PUBLIC_REVENUECAT_ANDROID_KEY", keys.android);
  let mod!: typeof import("./revenueCat");
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Platform } = require("react-native") as typeof import("react-native");
    jest.replaceProperty(Platform, "OS", os);
    // The jest preset's Platform.select always picks `ios`.
    jest.spyOn(Platform, "select").mockImplementation(((spec: Record<string, unknown>) => (os in spec ? spec[os] : spec.default)) as typeof Platform.select);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require("./revenueCat");
  });
  return mod;
}

afterEach(() => {
  process.env = { ...ENV };
  jest.restoreAllMocks();
});

describe("isPurchasingEnabled", () => {
  it("uses the App Store key on iOS", () => {
    expect(load("ios", { ios: "appl_x" }).isPurchasingEnabled()).toBe(true);
  });

  it("never configures the App Store key on Android (RevenueCat can't fetch its products from Play)", () => {
    expect(load("android", { ios: "appl_x" }).isPurchasingEnabled()).toBe(false);
    expect(load("android", { ios: "appl_x", android: "goog_x" }).isPurchasingEnabled()).toBe(true);
  });
});
