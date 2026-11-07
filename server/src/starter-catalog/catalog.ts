import type { Color, ItemCategory, Occasion, Pattern, Season, Wardrobe } from '@prisma/client';

/** A generic basic the user can add to the closet without a photo. Tags are the same as `Item`. */
export interface StarterItem {
  starterKey: string;
  name: string;
  category: ItemCategory;
  subcategory: string;
  primaryColor: Color;
  secondaryColor?: Color;
  pattern: Pattern;
  material?: string;
  formality: number;
  warmth: number;
  seasons: Season[];
  occasions: Occasion[];
  /** Which wardrobes this basic is offered to (`both` = unisex). */
  wardrobe: Wardrobe;
}

const ALL: Season[] = ['spring', 'summer', 'autumn', 'winter'];
const COLD: Season[] = ['autumn', 'winter'];
const WARM: Season[] = ['spring', 'summer'];
const MILD: Season[] = ['spring', 'autumn', 'winter'];

const WORKY: Occasion[] = ['work', 'event', 'date', 'travel'];
const SMART: Occasion[] = ['work', 'friends', 'date', 'event', 'casual', 'travel'];
const CASUAL: Occasion[] = ['friends', 'casual', 'travel', 'date'];
const EVERYDAY: Occasion[] = ['work', 'friends', 'date', 'casual', 'travel'];

/**
 * ~55 basics, womenswear first (decision #2: women first, then men), then unisex, then menswear.
 * `starterKey` is stable: it is stored on the Item. Pickers keep this order within a category.
 */
export const STARTER_CATALOG: StarterItem[] = [
  // Womenswear
  { starterKey: 'white-silk-shell', name: 'White silk shell', category: 'top', subcategory: 'shell', primaryColor: 'white', pattern: 'solid', material: 'silk', formality: 4, warmth: 1, seasons: ALL, occasions: SMART, wardrobe: 'womenswear' },
  { starterKey: 'cream-knit-cardigan', name: 'Cream knit cardigan', category: 'top', subcategory: 'cardigan', primaryColor: 'cream', pattern: 'texture', material: 'wool', formality: 3, warmth: 3, seasons: MILD, occasions: EVERYDAY, wardrobe: 'womenswear' },
  { starterKey: 'breton-tee', name: 'Striped breton tee', category: 'top', subcategory: 'breton', primaryColor: 'white', secondaryColor: 'navy', pattern: 'stripe', material: 'cotton', formality: 2, warmth: 2, seasons: ALL, occasions: CASUAL, wardrobe: 'womenswear' },
  { starterKey: 'cream-silk-blouse', name: 'Cream silk blouse', category: 'top', subcategory: 'blouse', primaryColor: 'cream', pattern: 'solid', material: 'silk', formality: 4, warmth: 2, seasons: ALL, occasions: WORKY, wardrobe: 'womenswear' },
  { starterKey: 'black-blouse', name: 'Black blouse', category: 'top', subcategory: 'blouse', primaryColor: 'black', pattern: 'solid', material: 'viscose', formality: 4, warmth: 2, seasons: ALL, occasions: WORKY, wardrobe: 'womenswear' },
  { starterKey: 'black-midi-skirt', name: 'Black midi skirt', category: 'bottom', subcategory: 'midi_skirt', primaryColor: 'black', pattern: 'solid', material: 'viscose', formality: 4, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'womenswear' },
  { starterKey: 'camel-pleated-skirt', name: 'Camel pleated skirt', category: 'bottom', subcategory: 'pleated_skirt', primaryColor: 'camel', pattern: 'solid', material: 'polyester', formality: 3, warmth: 2, seasons: MILD, occasions: EVERYDAY, wardrobe: 'womenswear' },
  { starterKey: 'cream-wide-leg-trousers', name: 'Cream wide-leg trousers', category: 'bottom', subcategory: 'wide_leg', primaryColor: 'cream', pattern: 'solid', material: 'wool blend', formality: 4, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'womenswear' },
  { starterKey: 'straight-jeans', name: 'Straight-leg jeans', category: 'bottom', subcategory: 'jeans', primaryColor: 'light_blue', pattern: 'solid', material: 'denim', formality: 2, warmth: 2, seasons: ALL, occasions: CASUAL, wardrobe: 'womenswear' },
  { starterKey: 'black-pencil-skirt', name: 'Black pencil skirt', category: 'bottom', subcategory: 'skirt', primaryColor: 'black', pattern: 'solid', material: 'wool', formality: 5, warmth: 2, seasons: ALL, occasions: WORKY, wardrobe: 'womenswear' },
  { starterKey: 'black-blazer-dress', name: 'Black blazer dress', category: 'dress', subcategory: 'blazer_dress', primaryColor: 'black', pattern: 'solid', material: 'wool', formality: 5, warmth: 2, seasons: MILD, occasions: WORKY, wardrobe: 'womenswear' },
  { starterKey: 'satin-slip-dress', name: 'Champagne slip dress', category: 'dress', subcategory: 'slip_dress', primaryColor: 'beige', pattern: 'solid', material: 'satin', formality: 4, warmth: 1, seasons: ['spring', 'summer', 'autumn'], occasions: ['date', 'event', 'friends'], wardrobe: 'womenswear' },
  { starterKey: 'black-midi-dress', name: 'Black midi dress', category: 'dress', subcategory: 'midi', primaryColor: 'black', pattern: 'solid', material: 'viscose', formality: 4, warmth: 2, seasons: ALL, occasions: ['work', 'date', 'event'], wardrobe: 'womenswear' },
  { starterKey: 'navy-shirt-dress', name: 'Navy shirt dress', category: 'dress', subcategory: 'shirt_dress', primaryColor: 'navy', pattern: 'solid', material: 'cotton', formality: 3, warmth: 2, seasons: ALL, occasions: ['work', 'friends', 'casual', 'travel'], wardrobe: 'womenswear' },
  { starterKey: 'floral-wrap-dress', name: 'Floral wrap dress', category: 'dress', subcategory: 'wrap', primaryColor: 'green', secondaryColor: 'cream', pattern: 'print', material: 'viscose', formality: 3, warmth: 1, seasons: WARM, occasions: ['date', 'friends', 'event', 'casual'], wardrobe: 'womenswear' },
  { starterKey: 'camel-belted-trench', name: 'Camel belted trench', category: 'outerwear', subcategory: 'trench', primaryColor: 'camel', pattern: 'solid', material: 'cotton', formality: 4, warmth: 3, seasons: ['spring', 'autumn'], occasions: EVERYDAY, wardrobe: 'womenswear' },
  { starterKey: 'black-cropped-blazer', name: 'Black cropped blazer', category: 'outerwear', subcategory: 'cropped_blazer', primaryColor: 'black', pattern: 'solid', material: 'wool', formality: 4, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'womenswear' },
  { starterKey: 'black-ballet-flats', name: 'Black ballet flats', category: 'shoes', subcategory: 'flats', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 3, warmth: 1, seasons: ALL, occasions: EVERYDAY, wardrobe: 'womenswear' },
  { starterKey: 'tan-block-heels', name: 'Tan block heels', category: 'shoes', subcategory: 'block_heels', primaryColor: 'camel', pattern: 'solid', material: 'suede', formality: 4, warmth: 1, seasons: ALL, occasions: ['work', 'date', 'event', 'friends'], wardrobe: 'womenswear' },
  { starterKey: 'brown-heeled-ankle-boots', name: 'Brown heeled ankle boots', category: 'shoes', subcategory: 'ankle_boots', primaryColor: 'brown', pattern: 'solid', material: 'suede', formality: 3, warmth: 4, seasons: COLD, occasions: EVERYDAY, wardrobe: 'womenswear' },
  { starterKey: 'black-loafers', name: 'Black loafers', category: 'shoes', subcategory: 'loafers', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 4, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'womenswear' },
  { starterKey: 'black-heels', name: 'Black heels', category: 'shoes', subcategory: 'heels', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 5, warmth: 1, seasons: ALL, occasions: WORKY, wardrobe: 'womenswear' },
  { starterKey: 'tan-leather-tote', name: 'Tan leather tote', category: 'accessory', subcategory: 'tote', primaryColor: 'camel', pattern: 'solid', material: 'leather', formality: 3, warmth: 1, seasons: ALL, occasions: EVERYDAY, wardrobe: 'womenswear' },
  { starterKey: 'black-waist-belt', name: 'Black waist belt', category: 'accessory', subcategory: 'belt', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 4, warmth: 1, seasons: ALL, occasions: SMART, wardrobe: 'womenswear' },
  { starterKey: 'black-tote', name: 'Black tote bag', category: 'accessory', subcategory: 'bag', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 4, warmth: 1, seasons: ALL, occasions: EVERYDAY, wardrobe: 'womenswear' },
  // Unisex
  { starterKey: 'white-oxford-shirt', name: 'White oxford shirt', category: 'top', subcategory: 'shirt', primaryColor: 'white', pattern: 'solid', material: 'cotton', formality: 4, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'light-blue-shirt', name: 'Light blue shirt', category: 'top', subcategory: 'shirt', primaryColor: 'light_blue', pattern: 'solid', material: 'cotton', formality: 4, warmth: 2, seasons: ALL, occasions: WORKY, wardrobe: 'both' },
  { starterKey: 'striped-shirt', name: 'Blue striped shirt', category: 'top', subcategory: 'shirt', primaryColor: 'white', secondaryColor: 'blue', pattern: 'stripe', material: 'cotton', formality: 3, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'white-tee', name: 'White t-shirt', category: 'top', subcategory: 'tshirt', primaryColor: 'white', pattern: 'solid', material: 'cotton', formality: 1, warmth: 1, seasons: ALL, occasions: [...CASUAL, 'sport'], wardrobe: 'both' },
  { starterKey: 'black-tee', name: 'Black t-shirt', category: 'top', subcategory: 'tshirt', primaryColor: 'black', pattern: 'solid', material: 'cotton', formality: 2, warmth: 1, seasons: ALL, occasions: [...CASUAL, 'sport'], wardrobe: 'both' },
  { starterKey: 'grey-crewneck-knit', name: 'Grey crewneck knit', category: 'top', subcategory: 'knit', primaryColor: 'grey', pattern: 'texture', material: 'wool', formality: 3, warmth: 4, seasons: MILD, occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'navy-knit', name: 'Navy knit', category: 'top', subcategory: 'knit', primaryColor: 'navy', pattern: 'solid', material: 'merino', formality: 3, warmth: 4, seasons: MILD, occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'black-turtleneck', name: 'Black turtleneck', category: 'top', subcategory: 'turtleneck', primaryColor: 'black', pattern: 'solid', material: 'merino', formality: 4, warmth: 4, seasons: COLD, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'grey-hoodie', name: 'Grey hoodie', category: 'top', subcategory: 'hoodie', primaryColor: 'grey', pattern: 'solid', material: 'cotton', formality: 1, warmth: 3, seasons: MILD, occasions: ['friends', 'casual', 'sport', 'travel'], wardrobe: 'both' },
  { starterKey: 'navy-chinos', name: 'Navy chinos', category: 'bottom', subcategory: 'chinos', primaryColor: 'navy', pattern: 'solid', material: 'cotton', formality: 3, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'beige-chinos', name: 'Beige chinos', category: 'bottom', subcategory: 'chinos', primaryColor: 'beige', pattern: 'solid', material: 'cotton', formality: 3, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'black-tailored-trousers', name: 'Black tailored trousers', category: 'bottom', subcategory: 'trousers', primaryColor: 'black', pattern: 'solid', material: 'wool', formality: 5, warmth: 3, seasons: ALL, occasions: WORKY, wardrobe: 'both' },
  { starterKey: 'grey-wool-trousers', name: 'Grey wool trousers', category: 'bottom', subcategory: 'trousers', primaryColor: 'grey', pattern: 'solid', material: 'wool', formality: 5, warmth: 3, seasons: MILD, occasions: WORKY, wardrobe: 'both' },
  { starterKey: 'blue-jeans', name: 'Blue jeans', category: 'bottom', subcategory: 'jeans', primaryColor: 'blue', pattern: 'solid', material: 'denim', formality: 2, warmth: 2, seasons: ALL, occasions: CASUAL, wardrobe: 'both' },
  { starterKey: 'black-jeans', name: 'Black jeans', category: 'bottom', subcategory: 'jeans', primaryColor: 'black', pattern: 'solid', material: 'denim', formality: 2, warmth: 2, seasons: ALL, occasions: [...CASUAL, 'event'], wardrobe: 'both' },
  { starterKey: 'black-joggers', name: 'Black joggers', category: 'bottom', subcategory: 'joggers', primaryColor: 'black', pattern: 'solid', material: 'cotton', formality: 1, warmth: 2, seasons: ALL, occasions: ['sport', 'casual', 'travel'], wardrobe: 'both' },
  { starterKey: 'navy-blazer', name: 'Navy blazer', category: 'outerwear', subcategory: 'blazer', primaryColor: 'navy', pattern: 'solid', material: 'wool', formality: 4, warmth: 3, seasons: ALL, occasions: WORKY, wardrobe: 'both' },
  { starterKey: 'camel-coat', name: 'Camel coat', category: 'outerwear', subcategory: 'coat', primaryColor: 'camel', pattern: 'solid', material: 'wool', formality: 4, warmth: 5, seasons: COLD, occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'black-leather-jacket', name: 'Black leather jacket', category: 'outerwear', subcategory: 'jacket', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 2, warmth: 3, seasons: MILD, occasions: ['friends', 'date', 'casual', 'event'], wardrobe: 'both' },
  { starterKey: 'beige-trench', name: 'Beige trench coat', category: 'outerwear', subcategory: 'trench', primaryColor: 'beige', pattern: 'solid', material: 'cotton', formality: 4, warmth: 3, seasons: ['spring', 'autumn'], occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'olive-field-jacket', name: 'Olive field jacket', category: 'outerwear', subcategory: 'jacket', primaryColor: 'olive', pattern: 'solid', material: 'cotton', formality: 2, warmth: 3, seasons: ['spring', 'autumn'], occasions: CASUAL, wardrobe: 'both' },
  { starterKey: 'white-sneakers', name: 'White sneakers', category: 'shoes', subcategory: 'sneakers', primaryColor: 'white', pattern: 'solid', material: 'leather', formality: 2, warmth: 2, seasons: ALL, occasions: [...CASUAL, 'work', 'sport'], wardrobe: 'both' },
  { starterKey: 'brown-loafers', name: 'Brown loafers', category: 'shoes', subcategory: 'loafers', primaryColor: 'brown', pattern: 'solid', material: 'leather', formality: 4, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'black-ankle-boots', name: 'Black ankle boots', category: 'shoes', subcategory: 'boots', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 3, warmth: 4, seasons: COLD, occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'brown-boots', name: 'Brown boots', category: 'shoes', subcategory: 'boots', primaryColor: 'brown', pattern: 'solid', material: 'leather', formality: 3, warmth: 4, seasons: COLD, occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'running-shoes', name: 'Running shoes', category: 'shoes', subcategory: 'sneakers', primaryColor: 'black', secondaryColor: 'white', pattern: 'solid', material: 'mesh', formality: 1, warmth: 2, seasons: ALL, occasions: ['sport', 'casual', 'travel'], wardrobe: 'both' },
  { starterKey: 'brown-leather-belt', name: 'Brown leather belt', category: 'accessory', subcategory: 'belt', primaryColor: 'brown', pattern: 'solid', material: 'leather', formality: 4, warmth: 1, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'black-leather-belt', name: 'Black leather belt', category: 'accessory', subcategory: 'belt', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 4, warmth: 1, seasons: ALL, occasions: WORKY, wardrobe: 'both' },
  { starterKey: 'grey-scarf', name: 'Grey wool scarf', category: 'accessory', subcategory: 'scarf', primaryColor: 'grey', pattern: 'solid', material: 'wool', formality: 3, warmth: 5, seasons: COLD, occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'silver-watch', name: 'Silver watch', category: 'accessory', subcategory: 'watch', primaryColor: 'grey', pattern: 'solid', material: 'steel', formality: 4, warmth: 1, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  // Menswear
  { starterKey: 'black-oxfords', name: 'Black oxford shoes', category: 'shoes', subcategory: 'oxfords', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 5, warmth: 2, seasons: ALL, occasions: WORKY, wardrobe: 'menswear' },
];

const BY_KEY = new Map(STARTER_CATALOG.map((s) => [s.starterKey, s]));

export const getStarterItem = (starterKey: string): StarterItem | undefined => BY_KEY.get(starterKey);

/** Items offered to a wardrobe (`both` sees everything). */
export const starterItemsFor = (wardrobe: Wardrobe): StarterItem[] =>
  wardrobe === 'both' ? STARTER_CATALOG : STARTER_CATALOG.filter((s) => s.wardrobe === 'both' || s.wardrobe === wardrobe);
