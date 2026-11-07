import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/useTheme";
import type { ButtonProps } from "./ButtonPrimary";

export function ButtonSecondary({ label, onPress, disabled, loading, testID }: ButtonProps) {
  const { colors, radius, spacing, fontSize } = useTheme();
  const inactive = disabled || loading;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        },
        (pressed || inactive) && styles.dim,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.foreground} />
      ) : (
        <Text style={[styles.label, { color: colors.foreground, fontSize: fontSize.md }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth },
  label: { fontWeight: "500" },
  dim: { opacity: 0.6 },
});
