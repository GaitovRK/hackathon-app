import { Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";
import { ChevronIcon } from "./ClosetIcons";

type Props = { count: number; onPress?: () => void };

/**
 * "3 new items to check" (board `.newchip`): doubtful leftovers from photo import. Renders nothing at 0,
 * so there is no permanent Mine / Not mine queue in the Closet.
 */
export function NewItemsChip({ count, onPress }: Props) {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  if (count <= 0) return null;
  return (
    <Pressable
      testID="closet-new-items"
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.chip, { backgroundColor: colors.surfaceAlt, borderRadius: radius.full, paddingLeft: spacing.md - 1, paddingRight: spacing.sm + 2, gap: spacing.xs + 2 }, pressed && styles.dim]}
    >
      <View style={[styles.dot, { backgroundColor: colors.like }]} />
      <Text style={{ color: colors.foreground, fontSize: fontSize.sm - 1, fontFamily: fontFamily.bodyBold }}>{t(count === 1 ? "closet.newItemsOne" : "closet.newItems", { count })}</Text>
      <ChevronIcon color={colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { height: 32, flexDirection: "row", alignItems: "center" },
  dot: { width: 9, height: 9, borderRadius: 5 },
  dim: { opacity: 0.7 },
});
