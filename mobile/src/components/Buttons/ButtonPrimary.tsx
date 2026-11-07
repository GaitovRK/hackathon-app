import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/useTheme";

export type ButtonProps = { label: string; onPress: () => void; disabled?: boolean; loading?: boolean; testID?: string };

export function ButtonPrimary({ label, onPress, disabled, loading, testID }: ButtonProps) {
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
        { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
        (pressed || inactive) && styles.dim,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.accentForeground} />
      ) : (
        <Text style={[styles.label, { color: colors.accentForeground, fontSize: fontSize.md }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
  label: { fontWeight: "600" },
  dim: { opacity: 0.6 },
});
