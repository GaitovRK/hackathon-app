import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { GarmentColor } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";

type Props = { colors: GarmentColor[]; children?: ReactNode; style?: object };

/** Flat color-blocked background built from an outfit's own colors (falls back to the brand blocks). No gradients. */
export function ColorBlocks({ colors: garmentColors, children, style }: Props) {
  const { blocks, colors } = useTheme();
  const fallback = [colors.blockA, colors.blockB, colors.blockC, colors.blockD];
  const unique = [...new Set(garmentColors)].slice(0, 3);
  const fills = unique.length ? unique.map((c) => blocks[c]) : fallback.slice(0, 3);
  while (fills.length < 3) fills.push(fallback[fills.length]);
  return (
    <View style={[styles.wrap, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.row, { backgroundColor: fills[0] }]} />
        <View style={styles.row}>
          <View style={[styles.flex, { backgroundColor: fills[1] }]} />
          <View style={[styles.flex, { backgroundColor: fills[2] }]} />
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { overflow: "hidden" }, row: { flex: 1, flexDirection: "row" }, flex: { flex: 1 } });
