import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/services/api/config";
import { notifyQuotaExceeded } from "@/services/api/quotaHandler";
import type { AuthResponse, CreateGenerationRequest, Generation, MeResponse } from "@/services/api/types";
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

const isQuotaExceeded = (error: FetchBaseQueryError | undefined) =>
  error?.status === 402 && (error.data as { code?: unknown } | undefined)?.code === "QUOTA_EXCEEDED";

/** Concurrent 401s share one re-auth request. */
let reauth: Promise<boolean> | null = null;

/**
 * - 401 → sign in anonymously again (new JWT), then retry the request once.
 * - 402 `QUOTA_EXCEEDED` → open the paywall (handler registered by the root layout).
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

  if (isQuotaExceeded(result.error)) notifyQuotaExceeded();
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Me", "Generation"],
  endpoints: (build) => ({
    authAnonymous: build.mutation<AuthResponse, void>({
      query: () => ({ url: AUTH_URL, method: "POST" }),
    }),
    me: build.query<MeResponse, void>({ query: () => "me", providesTags: ["Me"] }),
    createGeneration: build.mutation<Generation, CreateGenerationRequest>({
      query: (body) => ({ url: "generations", method: "POST", body }),
      invalidatesTags: ["Me", { type: "Generation", id: "LIST" }],
    }),
    /** Poll with `pollingInterval` until `status` is done/failed (see `isFinished`). */
    getGeneration: build.query<Generation, string>({
      query: (id) => `generations/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Generation", id }],
    }),
    listGenerations: build.query<Generation[], void>({
      query: () => "generations",
      providesTags: [{ type: "Generation", id: "LIST" }],
    }),
  }),
});

export const {
  useAuthAnonymousMutation,
  useMeQuery,
  useCreateGenerationMutation,
  useGetGenerationQuery,
  useListGenerationsQuery,
} = api;
