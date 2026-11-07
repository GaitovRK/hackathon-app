import type { ImageSourcePropType } from "react-native";

/**
 * Product cutouts for the most common starter basics (fal flux-schnell flat-lays, background removed), keyed by
 * `starterKey` (`server/src/starter-catalog/catalog.ts`). Starter items without an entry keep their silhouette.
 */
const IMAGES: Record<string, ImageSourcePropType> = {
  "beige-chinos": require("./starter-images/beige-chinos.png"),
  "beige-trench": require("./starter-images/beige-trench.png"),
  "black-ankle-boots": require("./starter-images/black-ankle-boots.png"),
  "black-ballet-flats": require("./starter-images/black-ballet-flats.png"),
  "black-jeans": require("./starter-images/black-jeans.png"),
  "black-leather-jacket": require("./starter-images/black-leather-jacket.png"),
  "black-midi-dress": require("./starter-images/black-midi-dress.png"),
  "black-midi-skirt": require("./starter-images/black-midi-skirt.png"),
  "black-tailored-trousers": require("./starter-images/black-tailored-trousers.png"),
  "black-tee": require("./starter-images/black-tee.png"),
  "blue-jeans": require("./starter-images/blue-jeans.png"),
  "breton-tee": require("./starter-images/breton-tee.png"),
  "cream-silk-blouse": require("./starter-images/cream-silk-blouse.png"),
  "grey-crewneck-knit": require("./starter-images/grey-crewneck-knit.png"),
  "grey-hoodie": require("./starter-images/grey-hoodie.png"),
  "light-blue-shirt": require("./starter-images/light-blue-shirt.png"),
  "navy-blazer": require("./starter-images/navy-blazer.png"),
  "straight-jeans": require("./starter-images/straight-jeans.png"),
  "white-oxford-shirt": require("./starter-images/white-oxford-shirt.png"),
  "white-sneakers": require("./starter-images/white-sneakers.png"),
  "white-tee": require("./starter-images/white-tee.png"),
};

export function starterImageFor(starterKey?: string | null): ImageSourcePropType | undefined {
  return starterKey ? IMAGES[starterKey] : undefined;
}
