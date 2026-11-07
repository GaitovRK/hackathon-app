import { Platform } from "react-native";

/**
 * Font families. `display` is the brand font (logo, watermark): Cormorant Garamond SemiBold,
 * embedded at build time by the expo-font plugin (app.json), for big titles. `displayItalic` is its
 * italic, for the emphasised second line of a headline (direction A).
 * iOS registers embedded fonts by PostScript name, Android by file name.
 */
export const fonts = Platform.select({
  android: { display: "CormorantGaramond_600SemiBold", displayItalic: "CormorantGaramond_600SemiBold_Italic" },
  default: { display: "CormorantGaramond-SemiBold", displayItalic: "CormorantGaramond-SemiBoldItalic" },
});

/** Cormorant's natural line height (hhea ascent + descent, 1.211 em). */
const DISPLAY_NATURAL_LINE_HEIGHT = 1.211;

/**
 * Line height for a display-font title. iOS lets glyphs overflow a tight line box; Android clips them, so
 * descenders (g, ç, ğ, ş) lost their bottom. Android gets at least the font's natural line height.
 */
export const displayLineHeight = (fontSize: number, lineHeight: number) =>
  Platform.OS === "android" ? Math.max(lineHeight, Math.ceil(fontSize * DISPLAY_NATURAL_LINE_HEIGHT)) : lineHeight;
