import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";
import { SearchIcon, SortIcon } from "./ClosetIcons";

type Props = { query: string; onQueryChange: (q: string) => void; sortOpen: boolean; onToggleSort: () => void };

/** Board option A: pill search field (`.search`) + round sort button (`.ib`). */
export function ClosetSearchBar({ query, onQueryChange, sortOpen, onToggleSort }: Props) {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  return (
    <View style={[styles.row, { gap: spacing.sm }]}>
      <View style={[styles.search, { backgroundColor: colors.surfaceAlt, borderRadius: radius.full, paddingHorizontal: spacing.md + 2, gap: spacing.sm }]}>
        <SearchIcon color={colors.muted} />
        <TextInput
          testID="closet-search"
          value={query}
          onChangeText={onQueryChange}
          placeholder={t("closet.searchPlaceholder")}
          placeholderTextColor={colors.muted}
          accessibilityLabel={t("closet.search")}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={[styles.input, { color: colors.foreground, fontSize: fontSize.sm, fontFamily: fontFamily.body }]}
        />
      </View>
      <Pressable
        testID="closet-sort-toggle"
        accessibilityRole="button"
        accessibilityLabel={t("closet.sort")}
        accessibilityState={{ expanded: sortOpen }}
        onPress={onToggleSort}
        style={({ pressed }) => [styles.iconButton, { backgroundColor: sortOpen ? colors.foreground : colors.surfaceAlt }, pressed && styles.dim]}
      >
        <SortIcon color={sortOpen ? colors.background : colors.foreground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  search: { flex: 1, height: 44, flexDirection: "row", alignItems: "center" },
  input: { flex: 1, height: 44, paddingVertical: 0 },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  dim: { opacity: 0.7 },
});
