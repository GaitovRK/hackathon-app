import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { shapeFor } from "@/components/Items/garmentShapes";
import type { GarmentColor, ItemCategory, LockedSlot, OutfitItem, OutfitSlot, Pattern } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";

/** What the flat-lay needs per garment; a locked idea only has the shape (`ghost`). */
export type FlatLayGarment = {
  category: ItemCategory;
  subcategory: string;
  name?: string;
  primaryColor?: GarmentColor;
  pattern?: Pattern;
  imageUrl?: string | null;
};

export type FlatLaySlot = { slot: OutfitSlot; garment: FlatLayGarment };

/** Board aspect ratio of the `.ol` box. */
export const FLAT_LAY_ASPECT = 0.68;

type Box = { left: number; top: number; width: number; height: number; z: number };

/** Percent positions of the board `.ol` slots (design-e.html). */
const BOX: Record<"top" | "bottom" | "belt" | "shoes" | "accessory" | "accessorySmall" | "dress", Box> = {
  top: { left: 16, top: 2, width: 68, height: 40, z: 3 },
  bottom: { left: 27, top: 37, width: 46, height: 50, z: 2 },
  belt: { left: 31, top: 39.6, width: 38, height: 5, z: 4 },
  shoes: { left: 22, top: 82, width: 56, height: 16, z: 5 },
  accessory: { left: 63, top: 45, width: 30, height: 22, z: 6 },
  accessorySmall: { left: 5, top: 30, width: 16, height: 24, z: 6 },
  dress: { left: 22, top: 2, width: 56, height: 82, z: 2 },
};

const SMALL_ACCESSORIES = new Set(["watch", "belt"]);

export const flatLaySlotsOf = (items: OutfitItem[]): FlatLaySlot[] => items.map((i) => ({ slot: i.slot, garment: i.item }));
export const flatLaySlotsOfLocked = (slots: LockedSlot[]): FlatLaySlot[] => slots.map((s) => ({ slot: s.slot, garment: { category: s.category, subcategory: s.subcategory } }));

type CutoutProps = { garment: FlatLayGarment; width: number; height: number; ghost: boolean; half?: "left" | "right" };

/**
 * One garment cutout scaled into a box (no tilt, no sticker cut). `half` shows only the left or right
 * half of the garment: the board's split layer, so an outer layer and the top under it both stay visible.
 */
function GarmentCutout({ garment, width, height, ghost, half }: CutoutProps) {
  const { colors, garment: palette, darkGarments } = useTheme();
  const fill = ghost ? colors.surfaceAlt : (palette[garment.primaryColor ?? "grey"] ?? palette.grey);
  const detail = garment.primaryColor && darkGarments.has(garment.primaryColor) ? colors.stickerDetailLight : colors.stickerDetail;
  const shape = shapeFor(garment.category, garment.subcategory);
  const stretch = garment.subcategory === "belt";
  const full = half ? width * 2 : width;

  const art =
    !ghost && garment.imageUrl ? (
      <Image source={{ uri: garment.imageUrl }} style={{ width: full, height }} contentFit="contain" accessibilityLabel={garment.name} />
    ) : (
      <Svg width={full} height={height} viewBox="0 0 100 100" preserveAspectRatio={stretch ? "none" : "xMidYMid meet"} accessibilityLabel={garment.name}>
        <Path d={shape.body} fill={fill} stroke={ghost ? colors.borderSoft : colors.stickerBodyStroke} strokeWidth={1} strokeLinejoin="round" />
        {!ghost && shape.detail ? <Path d={shape.detail} fill="none" stroke={detail} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" /> : null}
        {!ghost && shape.dots ? <Path d={shape.dots} fill="none" stroke={detail} strokeWidth={3} strokeLinecap="round" /> : null}
      </Svg>
    );
  if (!half) return art;
  return (
    <View style={{ width, height, overflow: "hidden" }} testID={`flatlay-half-${half}`}>
      <View style={{ width: full, height, marginLeft: half === "right" ? -width : 0 }}>{art}</View>
    </View>
  );
}

type Props = { slots: FlatLaySlot[]; width: number; ghost?: boolean; testID?: string };

/**
 * The half-and-half layered flat-lay (board screens 03, 06, 07): cutouts stacked top / bottom / shoes
 * with the accessory beside them. Outerwear is shown as its left half with the top's (or dress's) right
 * half next to it, so both layers read. Built from item cutouts only: no image generation.
 */
export function OutfitFlatLay({ slots, width, ghost = false, testID }: Props) {
  const height = width / FLAT_LAY_ASPECT;
  const by = Object.fromEntries(slots.map((s) => [s.slot, s.garment])) as Partial<Record<OutfitSlot, FlatLayGarment>>;
  const px = (b: Box) => ({ left: (b.left / 100) * width, top: (b.top / 100) * height, width: (b.width / 100) * width, height: (b.height / 100) * height, zIndex: b.z });

  const layered = (base: FlatLayGarment | undefined, box: Box, key: string) => {
    const p = px(box);
    const outer = by.outerwear;
    if (outer && base) {
      return (
        <View key={key} style={[styles.abs, p, styles.row]} testID={`flatlay-${key}-split`}>
          <GarmentCutout garment={outer} width={p.width / 2} height={p.height} ghost={ghost} half="left" />
          <GarmentCutout garment={base} width={p.width / 2} height={p.height} ghost={ghost} half="right" />
        </View>
      );
    }
    const only = base ?? outer;
    if (!only) return null;
    return (
      <View key={key} style={[styles.abs, p]} testID={`flatlay-${key}`}>
        <GarmentCutout garment={only} width={p.width} height={p.height} ghost={ghost} />
      </View>
    );
  };

  const single = (garment: FlatLayGarment | undefined, box: Box, key: string) => {
    if (!garment) return null;
    const p = px(box);
    return (
      <View key={key} style={[styles.abs, p]} testID={`flatlay-${key}`}>
        <GarmentCutout garment={garment} width={p.width} height={p.height} ghost={ghost} />
      </View>
    );
  };

  const accessory = by.accessory;
  const accessoryBox = accessory?.subcategory === "belt" ? BOX.belt : accessory && SMALL_ACCESSORIES.has(accessory.subcategory) ? BOX.accessorySmall : BOX.accessory;

  return (
    <View testID={testID} style={{ width, height }} accessibilityRole="image" accessibilityLabel={slots.map((s) => s.garment.name ?? s.garment.subcategory).join(", ")}>
      {by.dress ? layered(by.dress, BOX.dress, "dress") : layered(by.top, BOX.top, "top")}
      {single(by.bottom, BOX.bottom, "bottom")}
      {single(by.shoes, BOX.shoes, "shoes")}
      {single(accessory, accessoryBox, "accessory")}
    </View>
  );
}

const styles = StyleSheet.create({ abs: { position: "absolute" }, row: { flexDirection: "row" } });
