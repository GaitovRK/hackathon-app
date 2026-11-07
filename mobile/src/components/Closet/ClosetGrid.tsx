import { StyleSheet, useWindowDimensions, View } from "react-native";
import { ItemTile } from "@/components/Items/ItemTile";
import type { Item } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";

const COLUMNS = 3;

type Props = { items: Item[]; onOpenItem: (item: Item) => void };

/** 3-column grid of labelled cutout tiles (board option A); sized to the screen width minus the `Screen` padding. */
export function ClosetGrid({ items, onOpenItem }: Props) {
  const { spacing } = useTheme();
  const { width } = useWindowDimensions();
  const column = Math.floor((width - spacing.lg * 2 - spacing.sm * (COLUMNS - 1)) / COLUMNS);
  // ItemTile is `size + 2 × spacing.sm` wide.
  const size = Math.max(64, column - spacing.sm * 2);
  return (
    <View testID="closet-grid" style={[styles.grid, { gap: spacing.sm }]}>
      {items.map((item) => (
        <ItemTile key={item.id} testID={`item-${item.id}`} garment={item} size={size} label onPress={() => onOpenItem(item)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ grid: { flexDirection: "row", flexWrap: "wrap" } });
