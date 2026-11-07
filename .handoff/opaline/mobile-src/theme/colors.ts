import { useColorScheme } from "react-native";

/** Same palette as the web app (src/app/globals.css): direction A · Editorial studio (#108). */
const light = {
  background: "#f7f6f3",
  surface: "#ffffff",
  foreground: "#1c1917",
  muted: "#6b645e",
  border: "#e7e5e4",
  accent: "#1c1917",
  accentForeground: "#fafaf9",
  danger: "#b91c1c",
  success: "#15803d",
  warning: "#b45309",
  /** Badges and controls over photos. */
  scrim: "rgba(28,25,23,0.7)",
  onScrim: "#fafaf9",
};

const dark: typeof light = {
  background: "#0c0a09",
  surface: "#1c1917",
  foreground: "#f5f5f4",
  muted: "#a8a29e",
  border: "#292524",
  accent: "#f5f5f4",
  accentForeground: "#1c1917",
  danger: "#f87171",
  success: "#4ade80",
  warning: "#fbbf24",
  scrim: "rgba(12,10,9,0.6)",
  onScrim: "#f5f5f4",
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === "dark" ? dark : light;
}

export const radius = { sm: 6, md: 10, lg: 14, xl: 18, full: 999 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 40 } as const;
