import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type {
  AccountDto,
  ActiveJobsDto,
  BatchCreatedDto,
  BatchDto,
  BatchSummaryDto,
  CreateBatchRequest,
  CreditsDto,
  DeleteBatchesRequest,
  ModelDto,
  RegenerateRequest,
  SampleDto,
  SetRejectedRequest,
  UpscaleRequest,
} from "@shared/types/api";
import { API_URL } from "@/services/apiUrl";
import type { AppleSignInRequest, GoogleSignInRequest } from "@/services/auth/socialSignIn";
import { signedOut } from "./authSlice";

type LoginRequest = { username: string; password: string };
type SessionResponse = { username: string; token: string };
export type UploadTicket = { pathname: string; uploadUrl: string };
type UploadRequest = { filename: string; contentType: string; size: number };

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { token: string | null } }).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

/** An expired / revoked session signs the user out. */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  const isLogin = typeof args !== "string" && (args.url === "mobile/login" || args.url.startsWith("mobile/auth/"));
  if (result.error?.status === 401 && !isLogin) api.dispatch(signedOut());
  return result;
};

/** Same endpoints as the web app's store (src/store/api.ts), plus token login and signed uploads. */
export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Batch", "Jobs", "Credits", "Sample"],
  endpoints: (build) => ({
    login: build.mutation<SessionResponse, LoginRequest>({
      query: (body) => ({ url: "mobile/login", method: "POST", body }),
    }),
    appleLogin: build.mutation<SessionResponse, AppleSignInRequest>({
      query: (body) => ({ url: "mobile/auth/apple", method: "POST", body }),
    }),
    googleLogin: build.mutation<SessionResponse, GoogleSignInRequest>({
      query: (body) => ({ url: "mobile/auth/google", method: "POST", body }),
    }),
    /** Profile for the Account screen; read fresh each time it opens. */
    getAccount: build.query<AccountDto, void>({ query: () => "account" }),
    deleteAccount: build.mutation<{ ok: true }, void>({ query: () => ({ url: "account", method: "DELETE" }) }),
    requestUpload: build.mutation<UploadTicket, UploadRequest>({
      query: (body) => ({ url: "uploads", method: "POST", body }),
    }),
    getModels: build.query<ModelDto[], void>({ query: () => "models" }),
    /** Sample garments the user can try for free ("Try a sample"). */
    getSamples: build.query<SampleDto[], void>({ query: () => "samples", providesTags: ["Sample"] }),
    getBatches: build.query<BatchSummaryDto[], void>({
      query: () => "batches",
      providesTags: [{ type: "Batch", id: "LIST" }],
    }),
    getBatch: build.query<BatchDto, string>({
      query: (id) => `batches/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Batch", id }],
    }),
    createBatch: build.mutation<BatchCreatedDto, CreateBatchRequest>({
      query: (body) => ({ url: "batches", method: "POST", body }),
      // A sample batch also marks its sample as tried.
      invalidatesTags: [{ type: "Batch", id: "LIST" }, "Jobs", "Credits", "Sample"],
    }),
    deleteBatches: build.mutation<{ deleted: number }, DeleteBatchesRequest>({
      query: (body) => ({ url: "batches", method: "DELETE", body }),
      invalidatesTags: [{ type: "Batch", id: "LIST" }, "Jobs", "Sample"],
    }),
    regenerate: build.mutation<{ id: string }, RegenerateRequest>({
      query: ({ id, note }) => ({ url: `generations/${id}/regenerate`, method: "POST", body: { note } }),
      invalidatesTags: ["Batch", "Jobs", "Credits"],
    }),
    setRejected: build.mutation<{ ok: true }, SetRejectedRequest>({
      query: ({ id, rejected }) => ({ url: `generations/${id}`, method: "PATCH", body: { rejected } }),
      invalidatesTags: ["Batch"],
    }),
    upscale: build.mutation<{ queued: number }, UpscaleRequest>({
      query: (body) => ({ url: "upscales", method: "POST", body }),
      invalidatesTags: ["Batch", "Jobs"],
    }),
    getActiveJobs: build.query<ActiveJobsDto, void>({ query: () => "jobs", providesTags: ["Jobs"] }),
    getCredits: build.query<CreditsDto, void>({
      query: () => "credits",
      providesTags: ["Credits"],
      // The first purchase removes the watermark: reload the galleries to show the clean images.
      async onQueryStarted(_arg, { dispatch, getCacheEntry, queryFulfilled }) {
        const hadWatermark = getCacheEntry().data?.watermark;
        const { data } = await queryFulfilled.catch(() => ({ data: undefined }));
        if (hadWatermark && data && !data.watermark) dispatch(api.util.invalidateTags(["Batch"]));
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useAppleLoginMutation,
  useGoogleLoginMutation,
  useGetAccountQuery,
  useDeleteAccountMutation,
  useRequestUploadMutation,
  useGetModelsQuery,
  useGetSamplesQuery,
  useGetBatchesQuery,
  useGetBatchQuery,
  useCreateBatchMutation,
  useDeleteBatchesMutation,
  useGetActiveJobsQuery,
  useGetCreditsQuery,
  useRegenerateMutation,
  useSetRejectedMutation,
  useUpscaleMutation,
} = api;
