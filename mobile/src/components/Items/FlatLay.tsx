import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { GarmentSticker, type TileGarment } from "./ItemTile";

type Props = { garments: TileGarment[]; tileSize?: number; testID?: string };

/** An outfit or look as a flat-lay of stickers (a wrapping grid; the Skia collage comes later). */
export function FlatLay({ garments, tileSize = 96, testID }: Props) {
  const { spacing } = useTheme();
  return (
    <View testID={testID} style={[styles.grid, { gap: spacing.xs }]}>
      {garments.map((g, i) => (
        <GarmentSticker key={`${g.name}-${i}`} garment={g} size={tileSize} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center" } });
