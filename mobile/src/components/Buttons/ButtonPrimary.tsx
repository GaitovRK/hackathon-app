import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/useTheme";

export type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  /** 40h small pill (board `.btn.sm`). */
  small?: boolean;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Shrink to content instead of stretching. */
  inline?: boolean;
};

export type PillVariant = "primary" | "secondary" | "pop" | "ghost";

type PillProps = ButtonProps & { variant: PillVariant };

/** Board `.btn`: 52h pill, Figtree 700. primary = ink, secondary = mist, pop = volt (Pro / upsell), ghost = text only. Pressed scales to .97. */
export function PillButton({ label, onPress, disabled, loading, testID, small, icon, inline, variant }: PillProps) {
  const { colors, spacing, fontSize, fontFamily, block, radius } = useTheme();
  const inactive = disabled || loading;
  const bg =
    inactive && variant !== "ghost" ? colors.chip : variant === "primary" ? colors.ink : variant === "pop" ? colors.volt : variant === "secondary" ? colors.mist : "transparent";
  const text = inactive ? colors.ink3 : variant === "primary" ? colors.paper : colors.ink;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          height: small ? block.buttonHeightSmall : block.buttonHeight,
          paddingHorizontal: small ? spacing.lg : spacing.xl - 2,
          borderRadius: radius.btn,
          backgroundColor: bg,
          gap: spacing.sm,
          alignSelf: inline ? "flex-start" : "stretch",
        },
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} />
      ) : (
        <>
          {icon}
          <Text numberOfLines={1} style={{ color: text, fontSize: small ? fontSize.sm + 1 : fontSize.lg, fontFamily: fontFamily.bodyBold }}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

/** @deprecated kept for backward compatibility; use `PillButton`. */
export const ChunkyButton = PillButton;

export function ButtonPrimary(props: ButtonProps) {
  return <PillButton {...props} variant="primary" />;
}

const styles = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ scale: 0.97 }] },
});
