import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/useTheme";
import { CATEGORY_FILTERS, categoryFilterLabel, type CategoryFilter } from "./closetFilters";

type Props = { value: CategoryFilter; counts: Record<CategoryFilter, number>; onChange: (c: CategoryFilter) => void };

/**
 * Category chips with counts (board `.chip` + `.cnt`). Same tokens as the shared `Chip`, plus a muted count;
 * kept here so the shared Chip's props stay untouched.
 */
export function CategoryChips({ value, counts, onChange }: Props) {
  const { colors, radius, spacing, fontSize, fontFamily, block } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }} testID="closet-chips">
      {CATEGORY_FILTERS.map((c) => {
        const selected = c === value;
        return (
          <Pressable
            key={c}
            testID={`closet-chip-${c}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(c)}
            style={({ pressed }) => [
              styles.chip,
              {
                height: block.chipHeight,
                borderWidth: block.chipBorder,
                borderRadius: radius.full,
                paddingHorizontal: spacing.md + 2,
                gap: spacing.xs + 2,
                backgroundColor: selected ? colors.foreground : colors.surface,
                borderColor: colors.border,
              },
              pressed && styles.dim,
            ]}
          >
            <Text style={{ color: selected ? colors.background : colors.foreground, fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold }}>{categoryFilterLabel(c)}</Text>
            <Text testID={`closet-chip-${c}-count`} style={{ color: colors.muted, fontSize: fontSize.sm, fontFamily: fontFamily.bodySemibold }}>
              {counts[c]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ chip: { flexDirection: "row", alignItems: "center" }, dim: { opacity: 0.7 } });
