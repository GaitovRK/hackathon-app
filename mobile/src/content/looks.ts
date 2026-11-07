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

/** Same ids and item sets as `server/src/starter-catalog/looks.ts` (the server turns likes into style tags). */
export const LOOKS: LookContent[] = [
  { id: "look-office-classic", title: "Office classic", wardrobe: "both", items: [G.oxford, G.navyChinos, G.loafers, G.blazer] },
  { id: "look-monochrome", title: "All black", wardrobe: "both", items: [G.turtleneck, G.blackTrousers, G.ankleBoots] },
  { id: "look-camel-navy", title: "Camel and navy", wardrobe: "both", items: [G.navyKnit, G.greyTrousers, G.brownBoots, G.camelCoat] },
  { id: "look-weekend", title: "Weekend easy", wardrobe: "both", items: [G.whiteTee, G.blueJeans, G.sneakers, G.field] },
  { id: "look-smart-sneakers", title: "Smart with sneakers", wardrobe: "both", items: [G.blueShirt, G.beigeChinos, G.sneakers] },
  { id: "look-leather", title: "Leather edge", wardrobe: "both", items: [G.blackTee, G.blackJeans, G.ankleBoots, G.leather] },
  { id: "look-trench", title: "Trench season", wardrobe: "both", items: [G.stripedShirt, G.navyChinos, G.loafers, G.trench] },
  { id: "look-grey-knit", title: "Soft neutrals", wardrobe: "both", items: [G.greyKnit, G.beigeChinos, G.sneakers] },
  { id: "look-formal", title: "Boardroom", wardrobe: "menswear", items: [G.oxford, G.blackTrousers, G.oxfords, G.blackBelt] },
  { id: "look-athleisure", title: "Athleisure", wardrobe: "both", items: [G.hoodie, G.joggers, G.runners] },
  { id: "look-midi", title: "Midi and heels", wardrobe: "womenswear", items: [G.midiDress, G.heels, G.tote] },
  { id: "look-shirt-dress", title: "Shirt dress", wardrobe: "womenswear", items: [G.shirtDress, G.sneakers, G.trench] },
  { id: "look-silk-pencil", title: "Silk and pencil skirt", wardrobe: "womenswear", items: [G.silkBlouse, G.pencilSkirt, G.heels] },
  { id: "look-floral", title: "Floral day", wardrobe: "womenswear", items: [G.floralDress, G.sneakers] },
  { id: "look-blouse-jeans", title: "Blouse and jeans", wardrobe: "womenswear", items: [G.blackBlouse, G.blueJeans, G.ankleBoots, G.camelCoat] },
  { id: "look-scarf", title: "Winter layers", wardrobe: "both", items: [G.turtleneck, G.greyTrousers, G.ankleBoots, G.camelCoat, G.scarf] },
  { id: "look-blue-on-blue", title: "Blue on blue", wardrobe: "both", items: [G.blueShirt, G.blueJeans, G.loafers, G.brownBelt] },
  { id: "look-knit-jeans", title: "Knit and jeans", wardrobe: "both", items: [G.navyKnit, G.blueJeans, G.sneakers] },
  { id: "look-evening-black", title: "Evening black", wardrobe: "menswear", items: [G.blackTee, G.blackTrousers, G.oxfords, G.blazer] },
  { id: "look-watch", title: "Clean and watch", wardrobe: "both", items: [G.oxford, G.greyTrousers, G.loafers, G.watch] },
];

/** Looks for a wardrobe (`both` sees all; menswear / womenswear skip the other's looks). */
export const looksFor = (wardrobe: Wardrobe): LookContent[] => (wardrobe === "both" ? LOOKS : LOOKS.filter((l) => l.wardrobe === "both" || l.wardrobe === wardrobe));
