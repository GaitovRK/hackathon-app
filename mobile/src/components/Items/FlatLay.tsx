import { OutfitFlatLay } from "@/components/Outfit/OutfitFlatLay";
import type { TileGarment } from "./ItemTile";

type Props = { garments: TileGarment[]; tileSize?: number; testID?: string; ghost?: boolean };

/** An outfit or look as the layered flat-lay (`OutfitFlatLay`), sized from the old `tileSize` prop (width = 2 × tileSize). */
export function FlatLay({ garments, tileSize = 96, testID, ghost }: Props) {
  return <OutfitFlatLay garments={garments} width={tileSize * 2} testID={testID} ghost={ghost} />;
}
