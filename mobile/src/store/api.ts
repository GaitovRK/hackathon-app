import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { File } from "expo-file-system";
import { API_URL } from "@/services/api/config";
import { notifyQuotaExceeded } from "@/services/api/quotaHandler";
import {
  PAYWALL_CODES,
  type AuthResponse,
  type CreateGenerationRequest,
  type FeedbackValue,
  type Generation,
  type IdeasRequest,
  type IdeasResponse,
  type Item,
  type ItemPatch,
  type ItemPhotoResponse,
  type ItemPhotoUpload,
  type MeResponse,
  type Outfit,
  type SaveManyRequest,
  type PaywallCode,
  type StarterCatalogResponse,
  type StyleProfile,
  type StyleProfileUpdate,
  type StyleSwipe,
  type TodayRequest,
  type TodayResponse,
} from "@/services/api/types";
import { tokenStorage } from "@/services/session/tokenStorage";
import { sessionReady } from "./sessionSlice";

const AUTH_URL = "auth/anonymous";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { session: { token: string | null } }).session.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const urlOf = (args: string | FetchArgs) => (typeof args === "string" ? args : args.url).replace(/^\/+/, "");

const paywallCodeOf = (error: FetchBaseQueryError | undefined): PaywallCode | null => {
  if (error?.status !== 402) return null;
  const code = (error.data as { code?: unknown } | undefined)?.code;
  return typeof code === "string" && PAYWALL_CODES.has(code) ? (code as PaywallCode) : null;
};

/** Concurrent 401s share one re-auth request. */
let reauth: Promise<boolean> | null = null;

/**
 * - 401 → sign in anonymously again (new JWT), then retry the request once.
 * - 402 with a paywall code (`QUOTA_EXCEEDED`, `ITEM_LIMIT`, `REFRESH_LIMIT`) → open the paywall (handler registered by the root layout).
 */
export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extra) => {
  let result = await rawBaseQuery(args, api, extra);

  if (result.error?.status === 401 && urlOf(args) !== AUTH_URL) {
    reauth ??= (async () => {
      const auth = await rawBaseQuery({ url: AUTH_URL, method: "POST" }, api, extra);
      const session = auth.data as AuthResponse | undefined;
      if (!session?.token) return false;
      api.dispatch(sessionReady(session));
      await tokenStorage.save(session).catch(() => undefined);
      return true;
    })().finally(() => {
      reauth = null;
    });
    if (await reauth) result = await rawBaseQuery(args, api, extra);
  }

  const code = paywallCodeOf(result.error);
  if (code) notifyQuotaExceeded(code);
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Me", "Generation", "Profile", "Item", "Outfit"],
  endpoints: (build) => ({
    authAnonymous: build.mutation<AuthResponse, void>({
      query: () => ({ url: AUTH_URL, method: "POST" }),
    }),
    me: build.query<MeResponse, void>({ query: () => "me", providesTags: ["Me"] }),

    // Generations (fal; reused for garment cutouts later)
    createGeneration: build.mutation<Generation, CreateGenerationRequest>({
      query: (body) => ({ url: "generations", method: "POST", body }),
      invalidatesTags: ["Me", { type: "Generation", id: "LIST" }],
    }),
    getGeneration: build.query<Generation, string>({
      query: (id) => `generations/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Generation", id }],
    }),

    // Style profile + onboarding
    styleProfile: build.query<StyleProfile, void>({ query: () => "style-profile", providesTags: ["Profile"] }),
    updateStyleProfile: build.mutation<StyleProfile, StyleProfileUpdate>({
      query: (body) => ({ url: "style-profile", method: "PUT", body }),
      invalidatesTags: ["Profile", "Outfit"],
    }),
    addSwipes: build.mutation<StyleProfile, StyleSwipe[]>({
      query: (swipes) => ({ url: "style-profile/swipes", method: "POST", body: { swipes } }),
      invalidatesTags: ["Profile"],
    }),
    starterCatalog: build.query<StarterCatalogResponse, void>({ query: () => "starter-catalog" }),

    // Closet
    items: build.query<Item[], void>({
      query: () => "items",
      providesTags: (result) => [{ type: "Item", id: "LIST" }, ...(result ?? []).map((i) => ({ type: "Item" as const, id: i.id }))],
    }),
    addStarterItems: build.mutation<Item[], string[]>({
      query: (starterKeys) => ({ url: "items/starter", method: "POST", body: { starterKeys } }),
      invalidatesTags: ["Me", "Outfit", { type: "Item", id: "LIST" }],
    }),
    /**
     * Multipart upload (field `photo`); fetch sets the boundary, so no Content-Type here. Takes 5–20 s (cutout + tagging).
     * expo/fetch only accepts Blob parts (not RN's `{ uri, name, type }`), so the picked file goes in as an expo-file-system `File`.
     */
    uploadItemPhoto: build.mutation<ItemPhotoResponse, ItemPhotoUpload>({
      query: ({ uri, fileName }) => {
        const body = new FormData();
        body.append("photo", new File(uri), fileName ?? undefined);
        return { url: "items/photo", method: "POST", body };
      },
      invalidatesTags: ["Me", "Outfit", { type: "Item", id: "LIST" }],
    }),
    patchItem: build.mutation<Item, { id: string; patch: ItemPatch }>({
      query: ({ id, patch }) => ({ url: `items/${id}`, method: "PATCH", body: patch }),
      invalidatesTags: (_r, _e, { id }) => ["Outfit", { type: "Item", id }, { type: "Item", id: "LIST" }],
    }),
    archiveItem: build.mutation<Item, string>({
      query: (id) => ({ url: `items/${id}`, method: "DELETE" }),
      invalidatesTags: ["Me", "Outfit", { type: "Item", id: "LIST" }],
    }),

    // Outfits
    today: build.query<TodayResponse, TodayRequest>({
      query: ({ occasion, date, refresh }) => ({ url: "outfits/today", params: { occasion, date, ...(refresh ? { refresh: 1 } : {}) } }),
      providesTags: (_r, _e, { occasion, date }) => [{ type: "Outfit", id: `${date}:${occasion}` }, "Outfit"],
    }),
    refreshToday: build.mutation<TodayResponse, TodayRequest>({
      query: ({ occasion, date }) => ({ url: "outfits/today", params: { occasion, date, refresh: 1 } }),
      invalidatesTags: (_r, _e, { occasion, date }) => [{ type: "Outfit", id: `${date}:${occasion}` }],
    }),
    wearOutfit: build.mutation<Outfit, { id: string; date: string }>({
      query: ({ id, date }) => ({ url: `outfits/${id}/wear`, method: "POST", body: { date } }),
      invalidatesTags: ["Outfit"],
    }),
    saveOutfit: build.mutation<Outfit, string>({
      query: (id) => ({ url: `outfits/${id}/save`, method: "POST" }),
      invalidatesTags: ["Outfit"],
    }),
    outfitFeedback: build.mutation<{ ok: true }, { id: string; value: FeedbackValue }>({
      query: ({ id, value }) => ({ url: `outfits/${id}/feedback`, method: "POST", body: { value } }),
    }),
    savedOutfits: build.query<Outfit[], void>({ query: () => "outfits/saved", providesTags: ["Outfit"] }),
    outfit: build.query<Outfit, string>({ query: (id) => `outfits/${id}`, providesTags: (_r, _e, id) => [{ type: "Outfit", id }] }),

    // Outfit ideas (#9): generate persists nothing; save-many stores the liked ones
    generateIdeas: build.mutation<IdeasResponse, IdeasRequest>({
      query: (body) => ({ url: "outfits/ideas", method: "POST", body }),
    }),
    saveIdeas: build.mutation<Outfit[], SaveManyRequest>({
      query: (body) => ({ url: "outfits/save-many", method: "POST", body }),
      invalidatesTags: ["Outfit"],
    }),
  }),
});

export const {
  useAuthAnonymousMutation,
  useMeQuery,
  useCreateGenerationMutation,
  useGetGenerationQuery,
  useStyleProfileQuery,
  useUpdateStyleProfileMutation,
  useAddSwipesMutation,
  useStarterCatalogQuery,
  useItemsQuery,
  useAddStarterItemsMutation,
  usePatchItemMutation,
  useUploadItemPhotoMutation,
  useArchiveItemMutation,
  useTodayQuery,
  useRefreshTodayMutation,
  useWearOutfitMutation,
  useSaveOutfitMutation,
  useOutfitFeedbackMutation,
  useSavedOutfitsQuery,
  useOutfitQuery,
  useGenerateIdeasMutation,
  useSaveIdeasMutation,
} = api;
