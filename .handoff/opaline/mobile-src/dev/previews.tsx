import type { ReactNode } from "react";
import { AnalyticsLog } from "./AnalyticsLog";

/** Dev-only previews of this PR's UI changes, opened from the floating "Preview" button (coding-conventions). */
export type Preview = { title: string; render: () => ReactNode; screen?: boolean };

export const previews: Preview[] = [{ title: "Analytics — last 10 events (#78)", render: () => <AnalyticsLog /> }];
