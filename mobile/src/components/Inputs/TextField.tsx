import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { useTheme } from "@/theme/useTheme";

/** Themed multi-purpose text input. */
export function TextField(props: TextInputProps) {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      {...props}
      style={[
        styles.input,
        {
          color: colors.foreground,
          backgroundColor: colors.mist,
          borderColor: colors.line,
          borderRadius: radius.md,
          padding: spacing.md,
          fontSize: fontSize.md, fontFamily: fontFamily.body,
        },
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({ input: { borderWidth: StyleSheet.hairlineWidth, minHeight: 48 } });
