import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, useColors } from "@/theme/colors";

/** Dev-only floating button that opens the preview list (`/dev/preview`); renders nothing in release builds. */
export function DevPreviewButton() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  if (!__DEV__) return null;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push("/dev/preview")}
      style={[styles.button, { bottom: insets.bottom + 64, backgroundColor: c.accent }]}
    >
      <Text style={[styles.text, { color: c.accentForeground }]}>Preview</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { position: "absolute", right: 16, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, opacity: 0.85 },
  text: { fontSize: 13, fontWeight: "600" },
});
