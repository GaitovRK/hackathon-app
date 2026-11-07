import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import type { Item } from "@/services/api/types";
import { useUploadItemPhotoMutation } from "@/store/api";

export type PhotoSource = "camera" | "library";

/**
 * idle → processing (finding the garments, then rendering the flat-lays) → result (one item per garment);
 * `failed` = 502 (friendly retry), `invalid` = 400, `notClothing` = 422, `denied` = no permission.
 * A 402 ITEM_LIMIT opens the paywall in the base query and goes back to idle.
 */
export type AddPhotoState =
  | { step: "idle"; notice?: "cameraDenied" | "libraryDenied" | "invalid" | "notClothing" }
  | { step: "processing"; phase: "finding" | "rendering" }
  | { step: "result"; items: Item[]; tagged: boolean }
  | { step: "failed" };

const RENDERING_AFTER_MS = 5000;
const PICK_OPTIONS: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.6, allowsEditing: false };

/** Pick or take a photo, upload it to `POST /items/photo`, and track the screen state. */
export function useAddPhoto() {
  const [upload] = useUploadItemPhotoMutation();
  const [state, setState] = useState<AddPhotoState>({ step: "idle" });
  const [lastSource, setLastSource] = useState<PhotoSource>("library");

  const processing = state.step === "processing" && state.phase === "finding";
  useEffect(() => {
    if (!processing) return;
    const timer = setTimeout(() => setState((s) => (s.step === "processing" ? { step: "processing", phase: "rendering" } : s)), RENDERING_AFTER_MS);
    return () => clearTimeout(timer);
  }, [processing]);

  const pick = async (source: PhotoSource) => {
    setLastSource(source);
    const permission = source === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setState({ step: "idle", notice: source === "camera" ? "cameraDenied" : "libraryDenied" });
      return;
    }
    const picked = source === "camera" ? await ImagePicker.launchCameraAsync(PICK_OPTIONS) : await ImagePicker.launchImageLibraryAsync(PICK_OPTIONS);
    const asset = picked.canceled ? null : picked.assets?.[0];
    if (!asset) return;

    setState({ step: "processing", phase: "finding" });
    const res = await upload({ uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName });
    if ("data" in res && res.data) {
      setState({ step: "result", items: res.data.items, tagged: res.data.tagged });
      return;
    }
    const status = "error" in res ? (res.error as { status?: unknown } | undefined)?.status : undefined;
    if (status === 402) setState({ step: "idle" });
    else if (status === 400) setState({ step: "idle", notice: "invalid" });
    else if (status === 422) setState({ step: "idle", notice: "notClothing" });
    else setState({ step: "failed" });
  };

  return {
    state,
    pick,
    retry: () => pick(lastSource),
    reset: () => setState({ step: "idle" }),
    /** After a "Fix it" PATCH: swap the edited item in place; the result is tagged once the user confirmed it. */
    updateItem: (item: Item) => setState((s) => (s.step === "result" ? { ...s, items: s.items.map((i) => (i.id === item.id ? item : i)), tagged: true } : s)),
  };
}
