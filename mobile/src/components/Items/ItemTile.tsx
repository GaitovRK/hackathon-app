import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { G, Line, Path } from "react-native-svg";
import type { GarmentColor, ItemCategory, Pattern } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";
import { shapeFor, tiltFor } from "./garmentShapes";

export type TileGarment = {
  name: string;
  category: ItemCategory;
  subcategory: string;
  primaryColor: GarmentColor;
  pattern?: Pattern;
  imageUrl?: string | null;
};

type Props = {
  garment: TileGarment;
  size?: number;
  label?: boolean;
  selected?: boolean;
  /** Picker tiles get a thicker cut (board `.tile .st`). */
  thickCut?: boolean;
  /** Tilt in degrees; defaults to a deterministic lean per garment. */
  tilt?: number;
  onPress?: () => void;
  testID?: string;
};

/**
 * One garment as a die-cut sticker (board `.st`): the silhouette drawn as a hard offset shadow, a thick
 * white cut, the tinted body, then seam lines and buttons. A photo item shows its `imageUrl` instead.
 */
export function GarmentSticker({ garment, size = 96, thickCut = false, tilt }: Pick<Props, "garment" | "size" | "thickCut" | "tilt">) {
  const { colors, radius, garment: palette, darkGarments, block } = useTheme();
  if (garment.imageUrl) {
    return <Image source={{ uri: garment.imageUrl }} style={{ width: size, height: size, borderRadius: radius.md }} contentFit="cover" accessibilityLabel={garment.name} />;
  }
  const fill = palette[garment.primaryColor] ?? palette.grey;
  const shape = shapeFor(garment.category, garment.subcategory);
  const cut = thickCut ? block.stickerStrokeTile : block.stickerStroke;
  const detail = darkGarments.has(garment.primaryColor) ? colors.stickerDetailLight : colors.stickerDetail;
  const angle = tilt ?? tiltFor(garment.name, block.stickerTilt);
  return (
    <Svg width={size} height={size} viewBox="-10 -10 120 120" accessibilityLabel={garment.name}>
      <G rotation={angle} origin="50, 50">
        <G y={block.stickerShadowOffset}>
          <Path d={shape.body} fill={colors.stickerShadow} stroke={colors.stickerShadow} strokeWidth={cut} strokeLinejoin="round" />
        </G>
        <Path d={shape.body} fill={colors.sticker} stroke={colors.sticker} strokeWidth={cut} strokeLinejoin="round" />
        <Path d={shape.body} fill={fill} stroke={colors.stickerBodyStroke} strokeWidth={block.stickerBodyStroke} strokeLinejoin="round" />
        {shape.detail ? <Path d={shape.detail} fill="none" stroke={detail} strokeWidth={block.stickerDetailStroke} strokeLinecap="round" strokeLinejoin="round" /> : null}
        {shape.dots ? <Path d={shape.dots} fill="none" stroke={detail} strokeWidth={block.stickerDotStroke} strokeLinecap="round" /> : null}
        {garment.pattern === "stripe" ? [24, 38, 52, 66, 80].map((y) => <Line key={y} x1={20} x2={80} y1={y} y2={y} stroke={detail} strokeWidth={1.4} />) : null}
        {garment.pattern === "check"
          ? [30, 50, 70].flatMap((p) => [
              <Line key={`h${p}`} x1={20} x2={80} y1={p} y2={p} stroke={detail} strokeWidth={1.4} />,
              <Line key={`v${p}`} x1={p} x2={p} y1={14} y2={88} stroke={detail} strokeWidth={1.4} />,
            ])
          : null}
      </G>
    </Svg>
  );
}

/** A sticker on a tappable tile with an optional label; `selected` draws the chunky edge + hard shadow (board `.tile.sel`). */
export function ItemTile({ garment, size = 96, label = false, selected = false, thickCut = false, tilt, onPress, testID }: Props) {
  const { colors, radius, spacing, fontSize, fontFamily, block } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole={onPress ? "button" : "image"}
      accessibilityLabel={garment.name}
      accessibilityState={{ selected }}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.tile, { width: size + spacing.sm * 2, paddingBottom: block.tileShadowOffset }]}
    >
      {selected ? <View style={[styles.shadow, { backgroundColor: colors.border, borderRadius: radius.tile, top: block.tileShadowOffset }]} /> : null}
      <View
        style={{
          alignItems: "center",
          gap: spacing.xs,
          padding: spacing.sm,
          borderRadius: radius.tile,
          backgroundColor: selected ? colors.accentSoft : colors.tile,
          borderWidth: block.tileBorder,
          borderColor: selected ? colors.border : colors.borderSoft,
        }}
      >
        <GarmentSticker garment={garment} size={size - spacing.sm * 2} thickCut={thickCut || selected} tilt={tilt} />
        {label ? (
          <Text numberOfLines={2} style={{ color: colors.foreground, fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, textAlign: "center" }}>
            {garment.name}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({ tile: { alignItems: "stretch" }, shadow: { position: "absolute", left: 0, right: 0, bottom: 0 } });
