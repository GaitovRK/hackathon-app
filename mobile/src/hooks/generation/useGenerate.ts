import { useState } from "react";
import { isFinished, type Generation } from "@/services/api/types";
import { useCreateGenerationMutation, useGetGenerationQuery } from "@/store/api";

/** The image model the server allowlists (`server/src/fal/models.ts`). */
export const DEFAULT_MODEL = "flux-schnell";
const POLL_MS = 2000;

/** Submit a prompt, then poll the generation until it is done or failed. */
export function useGenerate() {
  const [id, setId] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<Generation["status"] | undefined>();
  const [create, createState] = useCreateGenerationMutation();
  const finished = isFinished(lastStatus);
  const current = useGetGenerationQuery(id ?? "", { skip: !id, pollingInterval: finished ? 0 : POLL_MS });
  const generation = id ? current.data : undefined;
  if (generation && generation.status !== lastStatus) setLastStatus(generation.status);

  const generate = async (prompt: string) => {
    setLastStatus(undefined);
    const result = await create({ model: DEFAULT_MODEL, input: { prompt } });
    if (result.data) setId(result.data.id);
  };

  return {
    generate,
    generation,
    busy: createState.isLoading || (!!id && !isFinished(generation?.status)),
    failed: generation?.status === "failed" || (createState.isError && (createState.error as { status?: unknown })?.status !== 402),
  };
}
