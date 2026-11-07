import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { useTheme } from "@/theme/useTheme";

/** Themed multi-purpose text input. */
export function TextField(props: TextInputProps) {
  const { colors, radius, spacing, fontSize } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      {...props}
      style={[
        styles.input,
        {
          color: colors.foreground,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          fontSize: fontSize.md,
        },
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({ input: { borderWidth: StyleSheet.hairlineWidth, minHeight: 48 } });
