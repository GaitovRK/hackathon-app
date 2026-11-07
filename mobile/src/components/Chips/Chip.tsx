import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/useTheme";

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
  /** filter (occasion / filters), tag (26h auto-tag), choice (answers, multi-select). */
  variant?: "filter" | "tag" | "choice";
  icon?: ReactNode;
};

/** Board `.chip` / `.tag`: mist pill, no border. Selected = lilac (liked / chosen), or ink for a `tag`. */
export function Chip({ label, selected = false, onPress, testID, variant = "filter", icon }: ChipProps) {
  const { colors, radius, spacing, fontSize, fontFamily, block } = useTheme();
  const tag = variant === "tag";
  const bg = !selected ? colors.mist : tag ? colors.ink : colors.lilac;
  const fg = selected && tag ? colors.paper : colors.ink;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          height: tag ? block.tagHeight : block.chipHeight,
          borderRadius: tag ? radius.sm + 2 : radius.full,
          paddingHorizontal: tag ? spacing.sm + 1 : spacing.md + 2,
          gap: spacing.xs + 2,
          backgroundColor: bg,
        },
        pressed && styles.dim,
      ]}
    >
      {icon}
      <Text style={{ color: fg, fontSize: tag ? fontSize.xs : fontSize.sm + 1, fontFamily: fontFamily.bodySemibold }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({ chip: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center" }, dim: { opacity: 0.75 } });
