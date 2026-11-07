/** Design tokens. Components read colors through `useTheme()`; never hard-code hex values in components. */
const light = {
  background: "#f7f7f8",
  surface: "#ffffff",
  foreground: "#18181b",
  muted: "#71717a",
  border: "#e4e4e7",
  accent: "#4f46e5",
  accentForeground: "#ffffff",
  danger: "#b91c1c",
  success: "#15803d",
  warning: "#b45309",
};

const dark: typeof light = {
  background: "#09090b",
  surface: "#18181b",
  foreground: "#fafafa",
  muted: "#a1a1aa",
  border: "#27272a",
  accent: "#818cf8",
  accentForeground: "#09090b",
  danger: "#f87171",
  success: "#4ade80",
  warning: "#fbbf24",
};

export type Colors = typeof light;
export const palettes = { light, dark } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 40 } as const;
export const radius = { sm: 6, md: 10, lg: 14, xl: 18, full: 999 } as const;
export const fontSize = { sm: 13, md: 15, lg: 17, xl: 22, xxl: 28 } as const;
