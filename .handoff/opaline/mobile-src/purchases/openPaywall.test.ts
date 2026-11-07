import Purchases from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { track } from "@/services/analytics";
import { presentPaywall } from "./openPaywall";
import { isPurchasingEnabled } from "./revenueCat";

jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: { isConfigured: jest.fn(), getCurrentOfferingForPlacement: jest.fn() },
}));
jest.mock("./revenueCat", () => ({ isPurchasingEnabled: jest.fn() }));
jest.mock("@/services/analytics", () => ({ track: jest.fn() }));

const offering = { identifier: "packs_first" };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(isPurchasingEnabled).mockReturnValue(true);
  jest.mocked(Purchases.isConfigured).mockResolvedValue(true);
  jest.mocked(Purchases.getCurrentOfferingForPlacement).mockResolvedValue(offering as never);
});

describe("presentPaywall", () => {
  it("shows the trigger's placement offering and passes the missing credits as a custom variable", async () => {
    await presentPaywall({ trigger: "out_of_credits", need: 40 });

    expect(Purchases.getCurrentOfferingForPlacement).toHaveBeenCalledWith("out_of_credits");
    expect(track).toHaveBeenCalledWith("paywall_viewed", { trigger: "out_of_credits" });
    expect(RevenueCatUI.presentPaywall).toHaveBeenCalledWith({
      offering,
      displayCloseButton: true,
      customVariables: { need_credits: { type: "number", value: 40 } },
    });
  });

  it("opens a locked model card's paywall on its own placement", async () => {
    await presentPaywall({ trigger: "model_locked" });
    expect(Purchases.getCurrentOfferingForPlacement).toHaveBeenCalledWith("model_locked");
  });

  it("uses the credit pill placement by default", async () => {
    await presentPaywall();
    expect(Purchases.getCurrentOfferingForPlacement).toHaveBeenCalledWith("credits_pill");
  });

  it("falls back to the current offering when the placement has none (or fails)", async () => {
    jest.mocked(Purchases.getCurrentOfferingForPlacement).mockRejectedValue(new Error("offline"));
    await presentPaywall({ trigger: "first_result" });

    expect(RevenueCatUI.presentPaywall).toHaveBeenCalledWith(expect.not.objectContaining({ offering: expect.anything() }));
  });

  it("doesn't present without a RevenueCat key or before the SDK is configured", async () => {
    jest.mocked(isPurchasingEnabled).mockReturnValue(false);
    expect(await presentPaywall()).toBe(PAYWALL_RESULT.NOT_PRESENTED);

    jest.mocked(isPurchasingEnabled).mockReturnValue(true);
    jest.mocked(Purchases.isConfigured).mockResolvedValue(false);
    expect(await presentPaywall()).toBe(PAYWALL_RESULT.NOT_PRESENTED);
    expect(RevenueCatUI.presentPaywall).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });
});
