// Native modules are mocked: tests never reach RevenueCat or the keychain.
jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    isConfigured: jest.fn(async () => false),
    logIn: jest.fn(),
    getOfferings: jest.fn(async () => ({ all: {}, current: null })),
    restorePurchases: jest.fn(async () => ({ entitlements: { active: {} } })),
    getCustomerInfo: jest.fn(async () => ({ entitlements: { active: {} } })),
  },
}));

jest.mock("react-native-purchases-ui", () => ({
  __esModule: true,
  PAYWALL_RESULT: { NOT_PRESENTED: "NOT_PRESENTED", PURCHASED: "PURCHASED", RESTORED: "RESTORED", CANCELLED: "CANCELLED", ERROR: "ERROR" },
  default: { presentPaywall: jest.fn(), presentPaywallIfNeeded: jest.fn() },
}));

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => void store.set(k, v)),
    deleteItemAsync: jest.fn(async (k: string) => void store.delete(k)),
  };
});

// expo-file-system's File is a Blob backed by a native file; tests only need a Blob.
jest.mock("expo-file-system", () => ({
  File: class extends Blob {
    constructor() {
      super(["photo"], { type: "image/jpeg" });
    }
  },
}));
