import { Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from "@expo-google-fonts/figtree";
import { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from "@expo-google-fonts/instrument-serif";
import { useFonts } from "expo-font";

/** Loads the design fonts (`tokens.fontFamily`). Text falls back to the system font until loaded or on error. */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({ InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold });
  return loaded || !!error;
}
