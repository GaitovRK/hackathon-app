import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";

/** Dev-only floating button that opens the preview list (`/dev/preview`); renders nothing in release builds. */
export function DevPreviewButton() {
  const { colors, radius, spacing, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  if (!__DEV__) return null;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push("/dev/preview")}
      style={[
        styles.button,
        { bottom: insets.bottom + 64, right: spacing.lg, backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
      ]}
    >
      <Text style={{ color: colors.accentForeground, fontSize: fontSize.sm, fontWeight: "600" }}>{t("dev.preview")}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({ button: { position: "absolute", opacity: 0.85 } });
