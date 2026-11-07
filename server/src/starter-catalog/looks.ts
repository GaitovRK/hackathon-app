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

/** 20 looks: 14 womenswear-led first (decision #2), then unisex and menswear. Ids match the app. */
export const LOOKS: Look[] = [
  { id: 'look-breton-flats', title: 'Breton weekend', starterKeys: ['breton-tee', 'straight-jeans', 'black-ballet-flats', 'tan-leather-tote'], wardrobe: 'womenswear' },
  { id: 'look-midi', title: 'Midi and heels', starterKeys: ['black-midi-dress', 'black-heels', 'black-tote'], wardrobe: 'womenswear' },
  { id: 'look-cardigan-midi', title: 'Soft knit and midi', starterKeys: ['cream-knit-cardigan', 'black-midi-skirt', 'brown-heeled-ankle-boots'], wardrobe: 'womenswear' },
  { id: 'look-silk-pencil', title: 'Silk and pencil skirt', starterKeys: ['cream-silk-blouse', 'black-pencil-skirt', 'black-heels'], wardrobe: 'womenswear' },
  { id: 'look-wide-leg', title: 'Wide-leg tailoring', starterKeys: ['white-silk-shell', 'cream-wide-leg-trousers', 'tan-block-heels', 'black-cropped-blazer'], wardrobe: 'womenswear' },
  { id: 'look-slip-leather', title: 'Slip and leather', starterKeys: ['satin-slip-dress', 'black-ankle-boots', 'black-leather-jacket'], wardrobe: 'womenswear' },
  { id: 'look-pleats-loafers', title: 'Pleats and loafers', starterKeys: ['white-silk-shell', 'camel-pleated-skirt', 'black-loafers', 'black-waist-belt'], wardrobe: 'womenswear' },
  { id: 'look-blazer-dress', title: 'Blazer dress', starterKeys: ['black-blazer-dress', 'tan-block-heels', 'tan-leather-tote'], wardrobe: 'womenswear' },
  { id: 'look-floral', title: 'Floral day', starterKeys: ['floral-wrap-dress', 'white-sneakers'], wardrobe: 'womenswear' },
  { id: 'look-trench-flats', title: 'Trench and flats', starterKeys: ['white-tee', 'straight-jeans', 'black-ballet-flats', 'camel-belted-trench'], wardrobe: 'womenswear' },
  { id: 'look-blouse-jeans', title: 'Blouse and jeans', starterKeys: ['black-blouse', 'blue-jeans', 'black-ankle-boots', 'camel-coat'], wardrobe: 'womenswear' },
  { id: 'look-cropped-blazer', title: 'Cropped blazer', starterKeys: ['black-turtleneck', 'straight-jeans', 'black-loafers', 'black-cropped-blazer'], wardrobe: 'womenswear' },
  { id: 'look-shirt-dress', title: 'Shirt dress', starterKeys: ['navy-shirt-dress', 'white-sneakers', 'beige-trench'], wardrobe: 'womenswear' },
  { id: 'look-cosy-errands', title: 'Cosy errands', starterKeys: ['cream-knit-cardigan', 'straight-jeans', 'white-sneakers', 'tan-leather-tote'], wardrobe: 'womenswear' },
  { id: 'look-office-classic', title: 'Office classic', starterKeys: ['white-oxford-shirt', 'navy-chinos', 'brown-loafers', 'navy-blazer'], wardrobe: 'both' },
  { id: 'look-monochrome', title: 'All black', starterKeys: ['black-turtleneck', 'black-tailored-trousers', 'black-ankle-boots'], wardrobe: 'both' },
  { id: 'look-weekend', title: 'Weekend easy', starterKeys: ['white-tee', 'blue-jeans', 'white-sneakers', 'olive-field-jacket'], wardrobe: 'both' },
  { id: 'look-athleisure', title: 'Athleisure', starterKeys: ['grey-hoodie', 'black-joggers', 'running-shoes'], wardrobe: 'both' },
  { id: 'look-formal', title: 'Boardroom', starterKeys: ['white-oxford-shirt', 'black-tailored-trousers', 'black-oxfords', 'black-leather-belt'], wardrobe: 'menswear' },
  { id: 'look-evening-black', title: 'Evening black', starterKeys: ['black-tee', 'black-tailored-trousers', 'black-oxfords', 'navy-blazer'], wardrobe: 'menswear' },
];

const BY_ID = new Map(LOOKS.map((l) => [l.id, l]));
export const getLook = (id: string): Look | undefined => BY_ID.get(id);
