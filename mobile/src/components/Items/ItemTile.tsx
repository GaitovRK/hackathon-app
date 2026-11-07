import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import { Icon } from "@/components/Icons/Icon";
import { starterImageFor } from "@/content/starterImages";
import type { GarmentColor, ItemCategory, Pattern } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";
import { shapeFor } from "./garmentShapes";

export type TileGarment = {
  name: string;
  category: ItemCategory;
  subcategory: string;
  primaryColor: GarmentColor;
  pattern?: Pattern;
  imageUrl?: string | null;
  starterKey?: string | null;
};

type Props = {
  garment: TileGarment;
  size?: number;
  label?: boolean;
  selected?: boolean;
  /** Kept for backward compatibility (the old sticker cut); ignored. */
  thickCut?: boolean;
  /** Kept for backward compatibility; cutouts sit straight. */
  tilt?: number;
  onPress?: () => void;
  testID?: string;
};

type CutoutProps = Pick<Props, "garment" | "size"> & { width?: number; height?: number; ghost?: boolean };

/**
 * One garment as a flat cutout (board `.gv`): the tinted silhouette with a faint edge, then seam lines and
 * buttons. No white cut, tilt or shadow. A photo item shows its `imageUrl` instead, a common starter basic its bundled
 * product cutout. `ghost` draws the grey locked silhouette.
 */
export function GarmentCutout({ garment, size = 96, width, height, ghost = false }: CutoutProps) {
  const { colors, radius, garment: palette, darkGarments, block } = useTheme();
  const w = width ?? size;
  const h = height ?? size;
  const photo = garment.imageUrl ? { uri: garment.imageUrl } : starterImageFor(garment.starterKey);
  if (photo && !ghost) {
    return <Image source={photo} style={{ width: w, height: h, borderRadius: radius.md }} contentFit="contain" accessibilityLabel={garment.name} />;
  }
  const fill = ghost ? colors.ghost : (palette[garment.primaryColor] ?? palette.grey);
  const shape = shapeFor(garment.category, garment.subcategory);
  const detail = ghost ? "transparent" : darkGarments.has(garment.primaryColor) ? colors.stickerDetailLight : colors.stickerDetail;
  return (
    <Svg width={w} height={h} viewBox="0 0 100 100"accessibilityLabel={garment.name}>
      <Path d={shape.body} fill={fill} stroke={ghost ? "none" : colors.stickerBodyStroke} strokeWidth={block.stickerBodyStroke} strokeLinejoin="round" />
      {shape.detail ? <Path d={shape.detail} fill="none" stroke={detail} strokeWidth={block.stickerDetailStroke} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {shape.dots ? <Path d={shape.dots} fill="none" stroke={detail} strokeWidth={block.stickerDotStroke} strokeLinecap="round" /> : null}
      {!ghost && garment.pattern === "stripe" ? [24, 38, 52, 66, 80].map((y) => <Line key={y} x1={20} x2={80} y1={y} y2={y} stroke={detail} strokeWidth={1.4} />) : null}
      {!ghost && garment.pattern === "check"
        ? [30, 50, 70].flatMap((p) => [
            <Line key={`h${p}`} x1={20} x2={80} y1={p} y2={p} stroke={detail} strokeWidth={1.4} />,
            <Line key={`v${p}`} x1={p} x2={p} y1={14} y2={88} stroke={detail} strokeWidth={1.4} />,
          ])
        : null}
    </Svg>
  );
}

/** @deprecated the sticker look is gone; kept so older imports still compile. */
export function GarmentSticker({ garment, size = 96 }: Pick<Props, "garment" | "size" | "thickCut" | "tilt">) {
  return <GarmentCutout garment={garment} size={size} />;
}

/**
 * A cutout on a mist tile with an optional label (board `.tile`). Pickable tiles (`onPress`) show a check:
 * a hollow ring when not picked, a filled ink check + 2px ink outline when `selected`.
 */
export function ItemTile({ garment, size = 96, label = false, selected = false, onPress, testID }: Props) {
  const { colors, radius, spacing, fontSize, fontFamily, block } = useTheme();
  const art = Math.round(size * 0.72);
  return (
    <Pressable
      testID={testID}
      accessibilityRole={onPress ? "button" : "image"}
      accessibilityLabel={garment.name}
      accessibilityState={{ selected }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: size, minHeight: size, borderRadius: radius.tile, backgroundColor: colors.tile, padding: spacing.sm, gap: spacing.xs + 2 },
        selected && { borderWidth: block.selectedBorder, borderColor: colors.ink, padding: spacing.sm - block.selectedBorder },
        pressed && styles.pressed,
      ]}
    >
      {onPress ? (
        <View style={[styles.tick, selected ? { backgroundColor: colors.ink } : { borderWidth: 1.5, borderColor: colors.ink3 }]}>
          {selected ? <Icon name="check" size={13} color={colors.paper} strokeWidth={3} /> : null}
        </View>
      ) : null}
      <GarmentCutout garment={garment} size={art} />
      {label ? (
        <Text numberOfLines={2} style={{ color: colors.ink, fontSize: fontSize.xs - 0.5, lineHeight: 13, fontFamily: fontFamily.bodySemibold, textAlign: "center" }}>
          {garment.name}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: "center", justifyContent: "center" },
  tick: { position: "absolute", right: 7, top: 7, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", zIndex: 2 },
  pressed: { transform: [{ scale: 0.97 }] },
});
