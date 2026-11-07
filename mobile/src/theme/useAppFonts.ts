import { BricolageGrotesque_800ExtraBold } from "@expo-google-fonts/bricolage-grotesque";
import { Figtree_400Regular, Figtree_600SemiBold, Figtree_800ExtraBold } from "@expo-google-fonts/figtree";
import { useFonts } from "expo-font";

/** Loads the design fonts (`tokens.fontFamily`). Text falls back to the system font until loaded or on error. */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({ BricolageGrotesque_800ExtraBold, Figtree_400Regular, Figtree_600SemiBold, Figtree_800ExtraBold });
  return loaded || !!error;
}
