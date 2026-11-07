import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/useTheme";

export type ButtonProps = { label: string; onPress: () => void; disabled?: boolean; loading?: boolean; testID?: string };

type ChunkyProps = ButtonProps & { variant: "primary" | "secondary" | "pop" };

/** Chunky button (board `.btn`): 58px face with a 2.5px edge over an offset edge-colored View as the hard shadow; pressing drops the face. */
export function ChunkyButton({ label, onPress, disabled, loading, testID, variant }: ChunkyProps) {
  const { colors, radius, spacing, fontSize, fontFamily, block } = useTheme();
  const inactive = disabled || loading;
  const face = variant === "primary" ? colors.accent : variant === "pop" ? colors.accentSoft : colors.surface;
  const text = variant === "primary" ? colors.accentForeground : colors.foreground;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={[styles.wrap, { paddingBottom: block.buttonShadowOffset }, inactive && styles.dim]}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.shadow, { backgroundColor: colors.border, borderRadius: radius.btn, top: block.buttonShadowOffset }]} />
          <View
            style={[
              styles.face,
              { height: block.buttonHeight, backgroundColor: face, borderColor: colors.border, borderWidth: block.buttonBorder, borderRadius: radius.btn, paddingHorizontal: spacing.xl },
              pressed && { transform: [{ translateY: block.buttonShadowOffset - 1 }] },
            ]}
          >
            {loading ? <ActivityIndicator color={text} /> : <Text style={{ color: text, fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold }}>{label}</Text>}
          </View>
        </>
      )}
    </Pressable>
  );
}

export function ButtonPrimary(props: ButtonProps) {
  return <ChunkyButton {...props} variant="primary" />;
}

const styles = StyleSheet.create({
  wrap: { alignSelf: "stretch" },
  shadow: { position: "absolute", left: 0, right: 0, bottom: 0 },
  face: { alignItems: "center", justifyContent: "center" },
  dim: { opacity: 0.5 },
});
