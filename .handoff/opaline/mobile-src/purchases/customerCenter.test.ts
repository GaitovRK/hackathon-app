import Purchases from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { presentCustomerCenter, restorePurchases } from "./customerCenter";
import { isPurchasingEnabled } from "./revenueCat";

jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: { isConfigured: jest.fn(), restorePurchases: jest.fn() },
}));
jest.mock("./revenueCat", () => ({ isPurchasingEnabled: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(isPurchasingEnabled).mockReturnValue(true);
  jest.mocked(Purchases.isConfigured).mockResolvedValue(true);
});

describe("presentCustomerCenter", () => {
  it("opens RevenueCat's Customer Center", async () => {
    expect(await presentCustomerCenter()).toBe(true);
    expect(RevenueCatUI.presentCustomerCenter).toHaveBeenCalled();
  });

  it("does nothing while purchases are off", async () => {
    jest.mocked(isPurchasingEnabled).mockReturnValue(false);
    expect(await presentCustomerCenter()).toBe(false);
    expect(RevenueCatUI.presentCustomerCenter).not.toHaveBeenCalled();
  });
});

describe("restorePurchases", () => {
  it("is restored when the Apple ID has purchases", async () => {
    jest.mocked(Purchases.restorePurchases).mockResolvedValue({ allPurchasedProductIdentifiers: ["opaline_pro_monthly"] } as never);
    expect(await restorePurchases()).toBe("restored");
  });

  it("is none when there is nothing to restore", async () => {
    jest.mocked(Purchases.restorePurchases).mockResolvedValue({ allPurchasedProductIdentifiers: [] } as never);
    expect(await restorePurchases()).toBe("none");
  });

  it("is unavailable before RevenueCat is configured", async () => {
    jest.mocked(Purchases.isConfigured).mockResolvedValue(false);
    expect(await restorePurchases()).toBe("unavailable");
    expect(Purchases.restorePurchases).not.toHaveBeenCalled();
  });
});
