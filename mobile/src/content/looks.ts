import type { GarmentColor, ItemCategory, Pattern, Wardrobe } from "@/services/api/types";

/** What a tile needs to draw a garment: the visual subset of the starter item tags. */
export type LookItem = { starterKey: string; name: string; category: ItemCategory; subcategory: string; primaryColor: GarmentColor; pattern: Pattern };

/** A curated look for the onboarding deck, rendered as a flat-lay of silhouettes (no images needed). */
export type LookContent = { id: string; title: string; wardrobe: Wardrobe; items: LookItem[] };

const g = (starterKey: string, name: string, category: ItemCategory, subcategory: string, primaryColor: GarmentColor, pattern: Pattern = "solid"): LookItem => ({
  starterKey,
  name,
  category,
  subcategory,
  primaryColor,
  pattern,
});

/** Visuals of the starter basics used by the looks (ids match `server/src/starter-catalog/catalog.ts`). */
const G = {
  // Womenswear
  silkShell: g("white-silk-shell", "White silk shell", "top", "blouse", "white"),
  cardigan: g("cream-knit-cardigan", "Cream knit cardigan", "top", "cardigan", "cream", "texture"),
  breton: g("breton-tee", "Striped breton tee", "top", "breton", "white", "stripe"),
  midiSkirt: g("black-midi-skirt", "Black midi skirt", "bottom", "midi_skirt", "black"),
  pleatedSkirt: g("camel-pleated-skirt", "Camel pleated skirt", "bottom", "pleated_skirt", "camel"),
  wideLeg: g("cream-wide-leg-trousers", "Cream wide-leg trousers", "bottom", "wide_leg", "cream"),
  straightJeans: g("straight-jeans", "Straight-leg jeans", "bottom", "jeans", "light_blue"),
  beltedTrench: g("camel-belted-trench", "Camel belted trench", "outerwear", "trench", "camel"),
  croppedBlazer: g("black-cropped-blazer", "Black cropped blazer", "outerwear", "cropped_blazer", "black"),
  blazerDress: g("black-blazer-dress", "Black blazer dress", "dress", "blazer_dress", "black"),
  slipDress: g("satin-slip-dress", "Champagne slip dress", "dress", "slip_dress", "beige"),
  flats: g("black-ballet-flats", "Black ballet flats", "shoes", "flats", "black"),
  blockHeels: g("tan-block-heels", "Tan block heels", "shoes", "block_heels", "camel"),
  heeledBoots: g("brown-heeled-ankle-boots", "Brown heeled ankle boots", "shoes", "ankle_boots", "brown"),
  blackLoafers: g("black-loafers", "Black loafers", "shoes", "loafers", "black"),
  tanTote: g("tan-leather-tote", "Tan leather tote", "accessory", "tote", "camel"),
  waistBelt: g("black-waist-belt", "Black waist belt", "accessory", "belt", "black"),
  // Unisex / menswear
  oxford: g("white-oxford-shirt", "White oxford shirt", "top", "shirt", "white"),
  blueShirt: g("light-blue-shirt", "Light blue shirt", "top", "shirt", "light_blue"),
  stripedShirt: g("striped-shirt", "Blue striped shirt", "top", "shirt", "white", "stripe"),
  whiteTee: g("white-tee", "White t-shirt", "top", "tshirt", "white"),
  blackTee: g("black-tee", "Black t-shirt", "top", "tshirt", "black"),
  greyKnit: g("grey-crewneck-knit", "Grey crewneck knit", "top", "knit", "grey", "texture"),
  navyKnit: g("navy-knit", "Navy knit", "top", "knit", "navy"),
  turtleneck: g("black-turtleneck", "Black turtleneck", "top", "turtleneck", "black"),
  silkBlouse: g("cream-silk-blouse", "Cream silk blouse", "top", "blouse", "cream"),
  blackBlouse: g("black-blouse", "Black blouse", "top", "blouse", "black"),
  hoodie: g("grey-hoodie", "Grey hoodie", "top", "hoodie", "grey"),
  navyChinos: g("navy-chinos", "Navy chinos", "bottom", "chinos", "navy"),
  beigeChinos: g("beige-chinos", "Beige chinos", "bottom", "chinos", "beige"),
  blackTrousers: g("black-tailored-trousers", "Black tailored trousers", "bottom", "trousers", "black"),
  greyTrousers: g("grey-wool-trousers", "Grey wool trousers", "bottom", "trousers", "grey"),
  blueJeans: g("blue-jeans", "Blue jeans", "bottom", "jeans", "blue"),
  blackJeans: g("black-jeans", "Black jeans", "bottom", "jeans", "black"),
  pencilSkirt: g("black-pencil-skirt", "Black pencil skirt", "bottom", "skirt", "black"),
  joggers: g("black-joggers", "Black joggers", "bottom", "joggers", "black"),
  midiDress: g("black-midi-dress", "Black midi dress", "dress", "midi", "black"),
  shirtDress: g("navy-shirt-dress", "Navy shirt dress", "dress", "shirt_dress", "navy"),
  floralDress: g("floral-wrap-dress", "Floral wrap dress", "dress", "wrap", "green", "print"),
  blazer: g("navy-blazer", "Navy blazer", "outerwear", "blazer", "navy"),
  camelCoat: g("camel-coat", "Camel coat", "outerwear", "coat", "camel"),
  leather: g("black-leather-jacket", "Black leather jacket", "outerwear", "jacket", "black"),
  trench: g("beige-trench", "Beige trench coat", "outerwear", "trench", "beige"),
  field: g("olive-field-jacket", "Olive field jacket", "outerwear", "jacket", "olive"),
  sneakers: g("white-sneakers", "White sneakers", "shoes", "sneakers", "white"),
  loafers: g("brown-loafers", "Brown loafers", "shoes", "loafers", "brown"),
  oxfords: g("black-oxfords", "Black oxford shoes", "shoes", "oxfords", "black"),
  heels: g("black-heels", "Black heels", "shoes", "heels", "black"),
  ankleBoots: g("black-ankle-boots", "Black ankle boots", "shoes", "boots", "black"),
  brownBoots: g("brown-boots", "Brown boots", "shoes", "boots", "brown"),
  runners: g("running-shoes", "Running shoes", "shoes", "sneakers", "black"),
  brownBelt: g("brown-leather-belt", "Brown leather belt", "accessory", "belt", "brown"),
  blackBelt: g("black-leather-belt", "Black leather belt", "accessory", "belt", "black"),
  scarf: g("grey-scarf", "Grey wool scarf", "accessory", "scarf", "grey"),
  tote: g("black-tote", "Black tote bag", "accessory", "bag", "black"),
  watch: g("silver-watch", "Silver watch", "accessory", "watch", "grey"),
};

/**
 * Same ids and item sets as `server/src/starter-catalog/looks.ts` (the server turns likes into style tags;
 * `looks.spec.ts` there fails if they drift). Women first (decision #2): 14 womenswear-led looks lead the
 * deck, then unisex and menswear.
 */
export const LOOKS: LookContent[] = [
  { id: "look-breton-flats", title: "Breton weekend", wardrobe: "womenswear", items: [G.breton, G.straightJeans, G.flats, G.tanTote] },
  { id: "look-midi", title: "Midi and heels", wardrobe: "womenswear", items: [G.midiDress, G.heels, G.tote] },
  { id: "look-cardigan-midi", title: "Soft knit and midi", wardrobe: "womenswear", items: [G.cardigan, G.midiSkirt, G.heeledBoots] },
  { id: "look-silk-pencil", title: "Silk and pencil skirt", wardrobe: "womenswear", items: [G.silkBlouse, G.pencilSkirt, G.heels] },
  { id: "look-wide-leg", title: "Wide-leg tailoring", wardrobe: "womenswear", items: [G.silkShell, G.wideLeg, G.blockHeels, G.croppedBlazer] },
  { id: "look-slip-leather", title: "Slip and leather", wardrobe: "womenswear", items: [G.slipDress, G.ankleBoots, G.leather] },
  { id: "look-pleats-loafers", title: "Pleats and loafers", wardrobe: "womenswear", items: [G.silkShell, G.pleatedSkirt, G.blackLoafers, G.waistBelt] },
  { id: "look-blazer-dress", title: "Blazer dress", wardrobe: "womenswear", items: [G.blazerDress, G.blockHeels, G.tanTote] },
  { id: "look-floral", title: "Floral day", wardrobe: "womenswear", items: [G.floralDress, G.sneakers] },
  { id: "look-trench-flats", title: "Trench and flats", wardrobe: "womenswear", items: [G.whiteTee, G.straightJeans, G.flats, G.beltedTrench] },
  { id: "look-blouse-jeans", title: "Blouse and jeans", wardrobe: "womenswear", items: [G.blackBlouse, G.blueJeans, G.ankleBoots, G.camelCoat] },
  { id: "look-cropped-blazer", title: "Cropped blazer", wardrobe: "womenswear", items: [G.turtleneck, G.straightJeans, G.blackLoafers, G.croppedBlazer] },
  { id: "look-shirt-dress", title: "Shirt dress", wardrobe: "womenswear", items: [G.shirtDress, G.sneakers, G.trench] },
  { id: "look-cosy-errands", title: "Cosy errands", wardrobe: "womenswear", items: [G.cardigan, G.straightJeans, G.sneakers, G.tanTote] },
  { id: "look-office-classic", title: "Office classic", wardrobe: "both", items: [G.oxford, G.navyChinos, G.loafers, G.blazer] },
  { id: "look-monochrome", title: "All black", wardrobe: "both", items: [G.turtleneck, G.blackTrousers, G.ankleBoots] },
  { id: "look-weekend", title: "Weekend easy", wardrobe: "both", items: [G.whiteTee, G.blueJeans, G.sneakers, G.field] },
  { id: "look-athleisure", title: "Athleisure", wardrobe: "both", items: [G.hoodie, G.joggers, G.runners] },
  { id: "look-formal", title: "Boardroom", wardrobe: "menswear", items: [G.oxford, G.blackTrousers, G.oxfords, G.blackBelt] },
  { id: "look-evening-black", title: "Evening black", wardrobe: "menswear", items: [G.blackTee, G.blackTrousers, G.oxfords, G.blazer] },
];

/** Looks for a wardrobe (`both` sees all; menswear / womenswear skip the other's looks). */
export const looksFor = (wardrobe: Wardrobe): LookContent[] => (wardrobe === "both" ? LOOKS : LOOKS.filter((l) => l.wardrobe === "both" || l.wardrobe === wardrobe));
