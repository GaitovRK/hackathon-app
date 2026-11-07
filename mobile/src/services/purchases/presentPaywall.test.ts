import Purchases from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { presentPaywall, setPaywallUnlockedHandler } from "./presentPaywall";

const purchases = jest.mocked(Purchases);
const ui = jest.mocked(RevenueCatUI);
const PRO = { entitlements: { active: { pro: {} } } } as unknown as Awaited<ReturnType<typeof Purchases.getCustomerInfo>>;

describe("presentPaywall", () => {
  const onUnlocked = jest.fn();

  beforeEach(() => {
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY = "test_key";
    purchases.isConfigured.mockResolvedValue(true);
    onUnlocked.mockReset();
    setPaywallUnlockedHandler(onUnlocked);
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
    setPaywallUnlockedHandler(null);
  });

  it("unlocks after a purchase", async () => {
    ui.presentPaywallIfNeeded.mockResolvedValueOnce(PAYWALL_RESULT.PURCHASED);
    await expect(presentPaywall()).resolves.toBe(true);
    expect(onUnlocked).toHaveBeenCalledTimes(1);
  });

  it("unlocks when RevenueCat already has pro and skips the paywall (402 while the server cache still says free)", async () => {
    ui.presentPaywallIfNeeded.mockResolvedValueOnce(PAYWALL_RESULT.NOT_PRESENTED);
    purchases.getCustomerInfo.mockResolvedValueOnce(PRO);
    await expect(presentPaywall()).resolves.toBe(true);
    expect(onUnlocked).toHaveBeenCalledTimes(1);
  });

  it("does not unlock when the user closes the paywall", async () => {
    ui.presentPaywallIfNeeded.mockResolvedValueOnce(PAYWALL_RESULT.CANCELLED);
    await expect(presentPaywall()).resolves.toBe(false);
    expect(onUnlocked).not.toHaveBeenCalled();
  });

  it("does not unlock when the paywall is not presented and RevenueCat has no pro", async () => {
    ui.presentPaywallIfNeeded.mockResolvedValueOnce(PAYWALL_RESULT.NOT_PRESENTED);
    await expect(presentPaywall()).resolves.toBe(false);
    expect(onUnlocked).not.toHaveBeenCalled();
  });
});
