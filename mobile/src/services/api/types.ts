export type AuthResponse = { token: string; userId: string };

export type MeResponse = { userId: string; isPro: boolean; freeLeftToday: number };

export type GenerationStatus = "queued" | "running" | "done" | "failed";

export type GenerationInput = { prompt: string };

export type Generation = {
  id: string;
  model: string;
  input: GenerationInput;
  status: GenerationStatus;
  imageUrl?: string | null;
  error?: string | null;
  createdAt: string;
};

export type CreateGenerationRequest = { model: string; input: GenerationInput };

/** Body of a 402 when the daily free quota is used up. */
export type QuotaExceededError = { code: "QUOTA_EXCEEDED"; message?: string };

export const isFinished = (status: GenerationStatus | undefined) => status === "done" || status === "failed";
