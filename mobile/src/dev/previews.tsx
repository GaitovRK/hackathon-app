import type { ReactNode } from "react";
import { GenerationCard } from "@/components/Cards/GenerationCard";
import { FreeLeftBadge } from "@/components/Status/FreeLeftBadge";

/** Dev-only previews of this PR's UI changes, opened from the floating "Preview" button (coding-conventions). Mock data only. */
export type Preview = { title: string; render: () => ReactNode };

const mock = { id: "preview-1", model: "flux-schnell", input: { prompt: "A neon fox in the rain" }, createdAt: new Date(0).toISOString() };

export const previews: Preview[] = [
  { title: "Home — generating", render: () => <GenerationCard generation={{ ...mock, status: "running" }} large /> },
  { title: "Home — failed", render: () => <GenerationCard generation={{ ...mock, status: "failed" }} large /> },
  { title: "Home — free left badge", render: () => <FreeLeftBadge freeLeftToday={2} isPro={false} /> },
];
