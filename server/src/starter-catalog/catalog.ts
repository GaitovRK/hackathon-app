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

/** ~30 basics, menswear / womenswear / unisex. `starterKey` is stable: it is stored on the Item. */
export const STARTER_CATALOG: StarterItem[] = [
  // Tops
  { starterKey: 'white-oxford-shirt', name: 'White oxford shirt', category: 'top', subcategory: 'shirt', primaryColor: 'white', pattern: 'solid', material: 'cotton', formality: 4, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'light-blue-shirt', name: 'Light blue shirt', category: 'top', subcategory: 'shirt', primaryColor: 'light_blue', pattern: 'solid', material: 'cotton', formality: 4, warmth: 2, seasons: ALL, occasions: WORKY, wardrobe: 'both' },
  { starterKey: 'striped-shirt', name: 'Blue striped shirt', category: 'top', subcategory: 'shirt', primaryColor: 'white', secondaryColor: 'blue', pattern: 'stripe', material: 'cotton', formality: 3, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'white-tee', name: 'White t-shirt', category: 'top', subcategory: 'tshirt', primaryColor: 'white', pattern: 'solid', material: 'cotton', formality: 1, warmth: 1, seasons: ALL, occasions: [...CASUAL, 'sport'], wardrobe: 'both' },
  { starterKey: 'black-tee', name: 'Black t-shirt', category: 'top', subcategory: 'tshirt', primaryColor: 'black', pattern: 'solid', material: 'cotton', formality: 2, warmth: 1, seasons: ALL, occasions: [...CASUAL, 'sport'], wardrobe: 'both' },
  { starterKey: 'grey-crewneck-knit', name: 'Grey crewneck knit', category: 'top', subcategory: 'knit', primaryColor: 'grey', pattern: 'texture', material: 'wool', formality: 3, warmth: 4, seasons: MILD, occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'navy-knit', name: 'Navy knit', category: 'top', subcategory: 'knit', primaryColor: 'navy', pattern: 'solid', material: 'merino', formality: 3, warmth: 4, seasons: MILD, occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'black-turtleneck', name: 'Black turtleneck', category: 'top', subcategory: 'turtleneck', primaryColor: 'black', pattern: 'solid', material: 'merino', formality: 4, warmth: 4, seasons: COLD, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'cream-silk-blouse', name: 'Cream silk blouse', category: 'top', subcategory: 'blouse', primaryColor: 'cream', pattern: 'solid', material: 'silk', formality: 4, warmth: 2, seasons: ALL, occasions: WORKY, wardrobe: 'womenswear' },
  { starterKey: 'black-blouse', name: 'Black blouse', category: 'top', subcategory: 'blouse', primaryColor: 'black', pattern: 'solid', material: 'viscose', formality: 4, warmth: 2, seasons: ALL, occasions: WORKY, wardrobe: 'womenswear' },
  { starterKey: 'grey-hoodie', name: 'Grey hoodie', category: 'top', subcategory: 'hoodie', primaryColor: 'grey', pattern: 'solid', material: 'cotton', formality: 1, warmth: 3, seasons: MILD, occasions: ['friends', 'casual', 'sport', 'travel'], wardrobe: 'both' },
  // Bottoms
  { starterKey: 'navy-chinos', name: 'Navy chinos', category: 'bottom', subcategory: 'chinos', primaryColor: 'navy', pattern: 'solid', material: 'cotton', formality: 3, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'beige-chinos', name: 'Beige chinos', category: 'bottom', subcategory: 'chinos', primaryColor: 'beige', pattern: 'solid', material: 'cotton', formality: 3, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'black-tailored-trousers', name: 'Black tailored trousers', category: 'bottom', subcategory: 'trousers', primaryColor: 'black', pattern: 'solid', material: 'wool', formality: 5, warmth: 3, seasons: ALL, occasions: WORKY, wardrobe: 'both' },
  { starterKey: 'grey-wool-trousers', name: 'Grey wool trousers', category: 'bottom', subcategory: 'trousers', primaryColor: 'grey', pattern: 'solid', material: 'wool', formality: 5, warmth: 3, seasons: MILD, occasions: WORKY, wardrobe: 'both' },
  { starterKey: 'blue-jeans', name: 'Blue jeans', category: 'bottom', subcategory: 'jeans', primaryColor: 'blue', pattern: 'solid', material: 'denim', formality: 2, warmth: 2, seasons: ALL, occasions: CASUAL, wardrobe: 'both' },
  { starterKey: 'black-jeans', name: 'Black jeans', category: 'bottom', subcategory: 'jeans', primaryColor: 'black', pattern: 'solid', material: 'denim', formality: 2, warmth: 2, seasons: ALL, occasions: [...CASUAL, 'event'], wardrobe: 'both' },
  { starterKey: 'black-pencil-skirt', name: 'Black pencil skirt', category: 'bottom', subcategory: 'skirt', primaryColor: 'black', pattern: 'solid', material: 'wool', formality: 5, warmth: 2, seasons: ALL, occasions: WORKY, wardrobe: 'womenswear' },
  { starterKey: 'black-joggers', name: 'Black joggers', category: 'bottom', subcategory: 'joggers', primaryColor: 'black', pattern: 'solid', material: 'cotton', formality: 1, warmth: 2, seasons: ALL, occasions: ['sport', 'casual', 'travel'], wardrobe: 'both' },
  // Dresses
  { starterKey: 'black-midi-dress', name: 'Black midi dress', category: 'dress', subcategory: 'midi', primaryColor: 'black', pattern: 'solid', material: 'viscose', formality: 4, warmth: 2, seasons: ALL, occasions: ['work', 'date', 'event'], wardrobe: 'womenswear' },
  { starterKey: 'navy-shirt-dress', name: 'Navy shirt dress', category: 'dress', subcategory: 'shirt_dress', primaryColor: 'navy', pattern: 'solid', material: 'cotton', formality: 3, warmth: 2, seasons: ALL, occasions: ['work', 'friends', 'casual', 'travel'], wardrobe: 'womenswear' },
  { starterKey: 'floral-wrap-dress', name: 'Floral wrap dress', category: 'dress', subcategory: 'wrap', primaryColor: 'green', secondaryColor: 'cream', pattern: 'print', material: 'viscose', formality: 3, warmth: 1, seasons: WARM, occasions: ['date', 'friends', 'event', 'casual'], wardrobe: 'womenswear' },
  // Outerwear
  { starterKey: 'navy-blazer', name: 'Navy blazer', category: 'outerwear', subcategory: 'blazer', primaryColor: 'navy', pattern: 'solid', material: 'wool', formality: 4, warmth: 3, seasons: ALL, occasions: WORKY, wardrobe: 'both' },
  { starterKey: 'camel-coat', name: 'Camel coat', category: 'outerwear', subcategory: 'coat', primaryColor: 'camel', pattern: 'solid', material: 'wool', formality: 4, warmth: 5, seasons: COLD, occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'black-leather-jacket', name: 'Black leather jacket', category: 'outerwear', subcategory: 'jacket', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 2, warmth: 3, seasons: MILD, occasions: ['friends', 'date', 'casual', 'event'], wardrobe: 'both' },
  { starterKey: 'beige-trench', name: 'Beige trench coat', category: 'outerwear', subcategory: 'trench', primaryColor: 'beige', pattern: 'solid', material: 'cotton', formality: 4, warmth: 3, seasons: ['spring', 'autumn'], occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'olive-field-jacket', name: 'Olive field jacket', category: 'outerwear', subcategory: 'jacket', primaryColor: 'olive', pattern: 'solid', material: 'cotton', formality: 2, warmth: 3, seasons: ['spring', 'autumn'], occasions: CASUAL, wardrobe: 'both' },
  // Shoes
  { starterKey: 'white-sneakers', name: 'White sneakers', category: 'shoes', subcategory: 'sneakers', primaryColor: 'white', pattern: 'solid', material: 'leather', formality: 2, warmth: 2, seasons: ALL, occasions: [...CASUAL, 'work', 'sport'], wardrobe: 'both' },
  { starterKey: 'brown-loafers', name: 'Brown loafers', category: 'shoes', subcategory: 'loafers', primaryColor: 'brown', pattern: 'solid', material: 'leather', formality: 4, warmth: 2, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'black-oxfords', name: 'Black oxford shoes', category: 'shoes', subcategory: 'oxfords', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 5, warmth: 2, seasons: ALL, occasions: WORKY, wardrobe: 'menswear' },
  { starterKey: 'black-heels', name: 'Black heels', category: 'shoes', subcategory: 'heels', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 5, warmth: 1, seasons: ALL, occasions: WORKY, wardrobe: 'womenswear' },
  { starterKey: 'black-ankle-boots', name: 'Black ankle boots', category: 'shoes', subcategory: 'boots', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 3, warmth: 4, seasons: COLD, occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'brown-boots', name: 'Brown boots', category: 'shoes', subcategory: 'boots', primaryColor: 'brown', pattern: 'solid', material: 'leather', formality: 3, warmth: 4, seasons: COLD, occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'running-shoes', name: 'Running shoes', category: 'shoes', subcategory: 'sneakers', primaryColor: 'black', secondaryColor: 'white', pattern: 'solid', material: 'mesh', formality: 1, warmth: 2, seasons: ALL, occasions: ['sport', 'casual', 'travel'], wardrobe: 'both' },
  // Accessories
  { starterKey: 'brown-leather-belt', name: 'Brown leather belt', category: 'accessory', subcategory: 'belt', primaryColor: 'brown', pattern: 'solid', material: 'leather', formality: 4, warmth: 1, seasons: ALL, occasions: SMART, wardrobe: 'both' },
  { starterKey: 'black-leather-belt', name: 'Black leather belt', category: 'accessory', subcategory: 'belt', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 4, warmth: 1, seasons: ALL, occasions: WORKY, wardrobe: 'both' },
  { starterKey: 'grey-scarf', name: 'Grey wool scarf', category: 'accessory', subcategory: 'scarf', primaryColor: 'grey', pattern: 'solid', material: 'wool', formality: 3, warmth: 5, seasons: COLD, occasions: EVERYDAY, wardrobe: 'both' },
  { starterKey: 'black-tote', name: 'Black tote bag', category: 'accessory', subcategory: 'bag', primaryColor: 'black', pattern: 'solid', material: 'leather', formality: 4, warmth: 1, seasons: ALL, occasions: EVERYDAY, wardrobe: 'womenswear' },
  { starterKey: 'silver-watch', name: 'Silver watch', category: 'accessory', subcategory: 'watch', primaryColor: 'grey', pattern: 'solid', material: 'steel', formality: 4, warmth: 1, seasons: ALL, occasions: SMART, wardrobe: 'both' },
];

const BY_KEY = new Map(STARTER_CATALOG.map((s) => [s.starterKey, s]));

export const getStarterItem = (starterKey: string): StarterItem | undefined => BY_KEY.get(starterKey);

/** Items offered to a wardrobe (`both` sees everything). */
export const starterItemsFor = (wardrobe: Wardrobe): StarterItem[] =>
  wardrobe === 'both' ? STARTER_CATALOG : STARTER_CATALOG.filter((s) => s.wardrobe === 'both' || s.wardrobe === wardrobe);
