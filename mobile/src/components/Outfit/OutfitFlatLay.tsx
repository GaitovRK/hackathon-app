import { StyleSheet, View, type DimensionValue } from "react-native";
import { GarmentCutout, type TileGarment } from "@/components/Items/ItemTile";

type Props = {
  garments: TileGarment[];
  /** Box width; height = width / 0.68 (board `.ol`). */
  width: number;
  /** Grey locked silhouettes (Pro). */
  ghost?: boolean;
  testID?: string;
};

type Slot = { left: number; top: number; width: number; height: number; z: number };

/** Slot boxes in % of the 0.68 box (board `.ol .top/.bot/.blt/.sho/.acc/.dre`). */
const SLOTS = {
  top: { left: 16, top: 2, width: 68, height: 40, z: 3 },
  bottom: { left: 27, top: 37, width: 46, height: 50, z: 2 },
  belt: { left: 31, top: 39.6, width: 38, height: 4, z: 4 },
  shoes: { left: 18, top: 78, width: 64, height: 21, z: 5 },
  acc: { left: 63, top: 45, width: 30, height: 22, z: 6 },
  dress: { left: 22, top: 2, width: 56, height: 82, z: 2 },
} satisfies Record<string, Slot>;

const pct = (n: number) => `${n}%` as DimensionValue;

/** Picks the garments for each slot: outer layer + base top, bottom or dress, belt, shoes, one accessory. */
export function slotGarments(garments: TileGarment[]) {
  const find = (pred: (g: TileGarment) => boolean) => garments.find(pred);
  const layer = find((g) => g.category === "outerwear");
  const base = find((g) => g.category === "top");
  const dress = find((g) => g.category === "dress");
  const bottom = dress ? undefined : find((g) => g.category === "bottom");
  const belt = find((g) => g.category === "accessory" && g.subcategory === "belt");
  const acc = find((g) => g.category === "accessory" && g.subcategory !== "belt");
  const shoes = find((g) => g.category === "shoes");
  return { layer, base, dress, bottom, belt, acc, shoes };
}

/**
 * The layered flat-lay (board `OutfitStack`): top over bottom over shoes. With an outer layer, the top
 * slot shows the outer layer as the left half and the base layer as the right half (hard vertical split).
 * Plain Views + SVG cutouts, no image generation.
 */
export function OutfitFlatLay({ garments, width, ghost = false, testID }: Props) {
  const height = width / 0.68;
  const s = slotGarments(garments);
  const box = (slot: Slot) => ({ position: "absolute" as const, left: pct(slot.left), top: pct(slot.top), width: pct(slot.width), height: pct(slot.height), zIndex: slot.z });
  const px = (slot: Slot) => ({ w: (slot.width / 100) * width, h: (slot.height / 100) * height });
  const cut = (g: TileGarment, slot: Slot) => <GarmentCutout garment={g} width={px(slot).w} height={px(slot).h} ghost={ghost} />;
  const top = SLOTS.top;
  const topPx = px(top);
  const label = garments.map((g) => g.name).join(", ");

  return (
    <View testID={testID} accessibilityRole="image" accessibilityLabel={label} style={{ width, height }}>
      {s.dress ? <View style={box(SLOTS.dress)}>{cut(s.dress, SLOTS.dress)}</View> : null}
      {!s.dress && s.layer && s.base ? (
        <View style={box(top)}>
          <View style={[styles.half, { left: 0, width: topPx.w / 2 }]}>
            <GarmentCutout garment={s.layer} width={topPx.w} height={topPx.h} ghost={ghost} />
          </View>
          <View style={[styles.half, { left: topPx.w / 2, width: topPx.w / 2 }]}>
            <View style={{ marginLeft: -topPx.w / 2 }}>
              <GarmentCutout garment={s.base} width={topPx.w} height={topPx.h} ghost={ghost} />
            </View>
          </View>
        </View>
      ) : null}
      {!s.dress && (s.layer ?? s.base) && !(s.layer && s.base) ? <View style={box(top)}>{cut((s.layer ?? s.base)!, top)}</View> : null}
      {s.dress && s.layer ? <View style={[box(top), { zIndex: 3 }]}>{cut(s.layer, top)}</View> : null}
      {s.bottom ? <View style={box(SLOTS.bottom)}>{cut(s.bottom, SLOTS.bottom)}</View> : null}
      {s.belt && !s.dress ? <View style={box(SLOTS.belt)}>{cut(s.belt, SLOTS.belt)}</View> : null}
      {s.shoes ? <View style={box(SLOTS.shoes)}>{cut(s.shoes, SLOTS.shoes)}</View> : null}
      {s.acc ? <View style={box(SLOTS.acc)}>{cut(s.acc, SLOTS.acc)}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({ half: { position: "absolute", top: 0, bottom: 0, overflow: "hidden" } });
