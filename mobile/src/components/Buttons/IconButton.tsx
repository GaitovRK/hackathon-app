import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/useTheme";

type Props = {
  icon: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  /** mist (default), line (hairline on paper), ink, lilac (active like / AI). */
  tone?: "mist" | "line" | "ink" | "lilac";
  size?: number;
  selected?: boolean;
  disabled?: boolean;
  testID?: string;
};

/** Board `.ib`: 44 circle. */
export function IconButton({ icon, onPress, accessibilityLabel, tone = "mist", size, selected, disabled, testID }: Props) {
  const { colors, block, radius } = useTheme();
  const s = size ?? block.iconButton;
  const bg = tone === "ink" ? colors.ink : tone === "lilac" ? colors.lilac : tone === "line" ? colors.paper : colors.mist;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ib,
        { width: s, height: s, borderRadius: radius.full, backgroundColor: bg },
        tone === "line" && { borderWidth: 1.5, borderColor: colors.line },
        pressed && styles.pressed,
        disabled && styles.dim,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({ ib: { alignItems: "center", justifyContent: "center" }, pressed: { transform: [{ scale: 0.94 }] }, dim: { opacity: 0.5 } });
