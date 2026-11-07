import { useColorScheme } from "react-native";
import { fontSize, palettes, radius, spacing, type Colors } from "./tokens";

export type Theme = { scheme: "light" | "dark"; colors: Colors; spacing: typeof spacing; radius: typeof radius; fontSize: typeof fontSize };

/** Light/dark tokens following the system appearance (app.json `userInterfaceStyle: automatic`). */
export function useTheme(): Theme {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  return { scheme, colors: palettes[scheme], spacing, radius, fontSize };
}
