import type { Wardrobe } from '@prisma/client';

/**
 * Curated looks for the onboarding swipe deck: each is a set of starter items rendered as a flat-lay.
 * The app ships the same list in `mobile/src/content/looks.ts` (render), the server keeps it to turn
 * likes into style tags (see `outfits/engine/profile.ts`).
 */
export interface Look {
  id: string;
  title: string;
  starterKeys: string[];
  wardrobe: Wardrobe;
}

export const LOOKS: Look[] = [
  { id: 'look-office-classic', title: 'Office classic', starterKeys: ['white-oxford-shirt', 'navy-chinos', 'brown-loafers', 'navy-blazer'], wardrobe: 'both' },
  { id: 'look-monochrome', title: 'All black', starterKeys: ['black-turtleneck', 'black-tailored-trousers', 'black-ankle-boots'], wardrobe: 'both' },
  { id: 'look-camel-navy', title: 'Camel and navy', starterKeys: ['navy-knit', 'grey-wool-trousers', 'brown-boots', 'camel-coat'], wardrobe: 'both' },
  { id: 'look-weekend', title: 'Weekend easy', starterKeys: ['white-tee', 'blue-jeans', 'white-sneakers', 'olive-field-jacket'], wardrobe: 'both' },
  { id: 'look-smart-sneakers', title: 'Smart with sneakers', starterKeys: ['light-blue-shirt', 'beige-chinos', 'white-sneakers'], wardrobe: 'both' },
  { id: 'look-leather', title: 'Leather edge', starterKeys: ['black-tee', 'black-jeans', 'black-ankle-boots', 'black-leather-jacket'], wardrobe: 'both' },
  { id: 'look-trench', title: 'Trench season', starterKeys: ['striped-shirt', 'navy-chinos', 'brown-loafers', 'beige-trench'], wardrobe: 'both' },
  { id: 'look-grey-knit', title: 'Soft neutrals', starterKeys: ['grey-crewneck-knit', 'beige-chinos', 'white-sneakers'], wardrobe: 'both' },
  { id: 'look-formal', title: 'Boardroom', starterKeys: ['white-oxford-shirt', 'black-tailored-trousers', 'black-oxfords', 'black-leather-belt'], wardrobe: 'menswear' },
  { id: 'look-athleisure', title: 'Athleisure', starterKeys: ['grey-hoodie', 'black-joggers', 'running-shoes'], wardrobe: 'both' },
  { id: 'look-midi', title: 'Midi and heels', starterKeys: ['black-midi-dress', 'black-heels', 'black-tote'], wardrobe: 'womenswear' },
  { id: 'look-shirt-dress', title: 'Shirt dress', starterKeys: ['navy-shirt-dress', 'white-sneakers', 'beige-trench'], wardrobe: 'womenswear' },
  { id: 'look-silk-pencil', title: 'Silk and pencil skirt', starterKeys: ['cream-silk-blouse', 'black-pencil-skirt', 'black-heels'], wardrobe: 'womenswear' },
  { id: 'look-floral', title: 'Floral day', starterKeys: ['floral-wrap-dress', 'white-sneakers'], wardrobe: 'womenswear' },
  { id: 'look-blouse-jeans', title: 'Blouse and jeans', starterKeys: ['black-blouse', 'blue-jeans', 'black-ankle-boots', 'camel-coat'], wardrobe: 'womenswear' },
  { id: 'look-scarf', title: 'Winter layers', starterKeys: ['black-turtleneck', 'grey-wool-trousers', 'black-ankle-boots', 'camel-coat', 'grey-scarf'], wardrobe: 'both' },
  { id: 'look-blue-on-blue', title: 'Blue on blue', starterKeys: ['light-blue-shirt', 'blue-jeans', 'brown-loafers', 'brown-leather-belt'], wardrobe: 'both' },
  { id: 'look-knit-jeans', title: 'Knit and jeans', starterKeys: ['navy-knit', 'blue-jeans', 'white-sneakers'], wardrobe: 'both' },
  { id: 'look-evening-black', title: 'Evening black', starterKeys: ['black-tee', 'black-tailored-trousers', 'black-oxfords', 'navy-blazer'], wardrobe: 'menswear' },
  { id: 'look-watch', title: 'Clean and watch', starterKeys: ['white-oxford-shirt', 'grey-wool-trousers', 'brown-loafers', 'silver-watch'], wardrobe: 'both' },
];

const BY_ID = new Map(LOOKS.map((l) => [l.id, l]));
export const getLook = (id: string): Look | undefined => BY_ID.get(id);
