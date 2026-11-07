import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/useTheme";

export type ChipProps = { label: string; selected?: boolean; onPress?: () => void; testID?: string };

/** Selectable pill (board `.chip`): 36px, 2px edge, ink when on. */
export function Chip({ label, selected = false, onPress, testID }: ChipProps) {
  const { colors, radius, spacing, fontSize, fontFamily, block } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          height: block.chipHeight,
          borderWidth: block.chipBorder,
          borderRadius: radius.full,
          paddingHorizontal: spacing.md + 2,
          backgroundColor: selected ? colors.foreground : colors.surface,
          borderColor: colors.border,
        },
        pressed && styles.dim,
      ]}
    >
      <Text style={{ color: selected ? colors.background : colors.foreground, fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({ chip: { alignSelf: "flex-start", justifyContent: "center" }, dim: { opacity: 0.7 } });
