import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import type { Item } from "@/services/api/types";
import { useUploadItemPhotoMutation } from "@/store/api";

export type PhotoSource = "camera" | "library";

/**
 * idle → processing (cutting, then tagging) → result; `failed` = 502 (friendly retry), `invalid` = 400,
 * `denied` = no permission. A 402 ITEM_LIMIT opens the paywall in the base query and goes back to idle.
 */
export type AddPhotoState =
  | { step: "idle"; notice?: "cameraDenied" | "libraryDenied" | "invalid" }
  | { step: "processing"; phase: "cutting" | "tagging" }
  | { step: "result"; item: Item; tagged: boolean }
  | { step: "failed" };

const TAGGING_AFTER_MS = 4000;
const PICK_OPTIONS: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.6, allowsEditing: false };

/** Pick or take a photo, upload it to `POST /items/photo`, and track the screen state. */
export function useAddPhoto() {
  const [upload] = useUploadItemPhotoMutation();
  const [state, setState] = useState<AddPhotoState>({ step: "idle" });
  const [lastSource, setLastSource] = useState<PhotoSource>("library");

  const processing = state.step === "processing" && state.phase === "cutting";
  useEffect(() => {
    if (!processing) return;
    const timer = setTimeout(() => setState((s) => (s.step === "processing" ? { step: "processing", phase: "tagging" } : s)), TAGGING_AFTER_MS);
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

    setState({ step: "processing", phase: "cutting" });
    const res = await upload({ uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName });
    if ("data" in res && res.data) {
      setState({ step: "result", item: res.data.item, tagged: res.data.tagged });
      return;
    }
    const status = "error" in res ? (res.error as { status?: unknown } | undefined)?.status : undefined;
    if (status === 402) setState({ step: "idle" });
    else if (status === 400) setState({ step: "idle", notice: "invalid" });
    else setState({ step: "failed" });
  };

  return {
    state,
    pick,
    retry: () => pick(lastSource),
    reset: () => setState({ step: "idle" }),
    updateItem: (item: Item) => setState((s) => (s.step === "result" ? { ...s, item, tagged: true } : s)),
  };
}
