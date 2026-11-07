import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Provider } from "react-redux";
import { setQuotaExceededHandler } from "@/services/api/quotaHandler";
import type { Item } from "@/services/api/types";
import { makeStore, type AppStore } from "@/store";
import { api } from "@/store/api";
import { sessionReady } from "@/store/sessionSlice";
import AddPhotoScreen from "@/app/add-photo";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() } }));
jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const picker = jest.mocked(ImagePicker);
const json = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

const photoItem: Item = {
  id: "p1",
  source: "photo",
  imageUrl: "https://cdn.example.com/cutouts/p1.png",
  name: "Cream silk blouse",
  category: "top",
  subcategory: "blouse",
  primaryColor: "cream",
  pattern: "solid",
  formality: 3,
  warmth: 2,
  seasons: [],
  occasions: [],
  createdAt: "2026-11-07T15:00:00.000Z",
};

type Reply = { status: number; body: unknown };
let uploadReply: Reply;
let requests: { url: string; method: string; body: unknown }[] = [];
let store: AppStore | null = null;

async function renderScreen() {
  store = makeStore();
  store.dispatch(sessionReady({ token: "jwt", userId: "u1" }));
  await render(
    <Provider store={store}>
      <AddPhotoScreen />
    </Provider>,
  );
  await waitFor(() => expect(screen.getByTestId("add-photo-pick")).toBeTruthy());
}

describe("AddPhotoScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requests = [];
    uploadReply = { status: 201, body: { item: photoItem, tagged: true } };
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [{ uri: "file:///blouse.jpg", mimeType: "image/jpeg", fileName: "blouse.jpg", width: 1, height: 1 }] } as never);
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const req = input as Request;
      const url = String(req.url ?? input);
      requests.push({ url, method: req.method ?? "GET", body: req.body });
      if (url.endsWith("/items/photo")) return json(uploadReply.body, uploadReply.status);
      if (url.endsWith("/items/p1") && req.method === "PATCH") {
        const patch = (await req.json()) as Partial<Item>;
        return json({ ...photoItem, ...patch });
      }
      return json({}, 404);
    }) as unknown as typeof fetch;
  });
  afterEach(() => {
    setQuotaExceededHandler(null);
    store?.dispatch(api.util.resetApiState());
  });

  it("picks a photo, shows processing, then the tagged result card", async () => {
    let finish: (() => void) | null = null;
    const gate = new Promise<void>((r) => (finish = r));
    const original = globalThis.fetch;
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      await gate;
      return original(input);
    }) as unknown as typeof fetch;

    await renderScreen();
    fireEvent.press(screen.getByTestId("add-photo-library"));
    await waitFor(() => expect(screen.getByTestId("add-photo-processing")).toBeTruthy());
    expect(screen.getByText("Cutting it out…")).toBeTruthy();
    expect(picker.launchImageLibraryAsync).toHaveBeenCalledWith({ mediaTypes: ["images"], quality: 0.6, allowsEditing: false });

    finish!();
    await waitFor(() => expect(screen.getByTestId("add-photo-result")).toBeTruthy());
    expect(screen.getByTestId("add-photo-name")).toHaveTextContent("Cream silk blouse");
    expect(screen.queryByTestId("add-photo-edit")).toBeNull();
    const upload = requests.find((r) => r.url.endsWith("/items/photo"));
    expect(upload?.method).toBe("POST");

    fireEvent.press(screen.getByTestId("add-photo-done"));
    expect(router.replace).toHaveBeenCalledWith("/closet");
  });

  it("opens the paywall on 402 ITEM_LIMIT and goes back to the picker", async () => {
    const paywall = jest.fn();
    setQuotaExceededHandler(paywall);
    uploadReply = { status: 402, body: { code: "ITEM_LIMIT" } };
    await renderScreen();
    fireEvent.press(screen.getByTestId("add-photo-library"));
    await waitFor(() => expect(paywall).toHaveBeenCalledWith("ITEM_LIMIT"));
    await waitFor(() => expect(screen.getByTestId("add-photo-pick")).toBeTruthy());
  });

  it("shows a friendly retry state on 502 PHOTO_PROCESSING_FAILED", async () => {
    uploadReply = { status: 502, body: { code: "PHOTO_PROCESSING_FAILED" } };
    await renderScreen();
    fireEvent.press(screen.getByTestId("add-photo-library"));
    await waitFor(() => expect(screen.getByTestId("add-photo-failed")).toBeTruthy());
    uploadReply = { status: 201, body: { item: photoItem, tagged: true } };
    fireEvent.press(screen.getByTestId("add-photo-retry"));
    await waitFor(() => expect(screen.getByTestId("add-photo-result")).toBeTruthy());
  });

  it("explains when camera access is denied", async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: false } as never);
    await renderScreen();
    fireEvent.press(screen.getByTestId("add-photo-camera"));
    await waitFor(() => expect(screen.getByText(/Camera access is off/)).toBeTruthy());
    expect(picker.launchCameraAsync).not.toHaveBeenCalled();
  });
  it("opens the edit state straight away when tagged is false, and PATCHes the fix", async () => {
    uploadReply = { status: 201, body: { item: { ...photoItem, name: "Item" }, tagged: false } };
    await renderScreen();
    fireEvent.press(screen.getByTestId("add-photo-library"));
    await waitFor(() => expect(screen.getByTestId("add-photo-edit")).toBeTruthy());
    expect(screen.getAllByText("We couldn't tell what this is; pick a category.").length).toBeGreaterThan(0);

    fireEvent.press(screen.getByTestId("add-photo-category-dress"));
    fireEvent.changeText(screen.getByTestId("add-photo-edit-name"), "Black slip dress");
    fireEvent.press(screen.getByTestId("add-photo-color-black"));
    fireEvent.press(screen.getByTestId("add-photo-save"));
    await waitFor(() => expect(screen.getByTestId("add-photo-fix")).toBeTruthy());
    expect(requests.some((r) => r.url.endsWith("/items/p1") && r.method === "PATCH")).toBe(true);
    expect(screen.getByTestId("add-photo-name")).toHaveTextContent("Black slip dress");
  });
});
