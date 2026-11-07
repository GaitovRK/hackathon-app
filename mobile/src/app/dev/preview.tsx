import { Redirect } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import { Screen } from "@/components/Layout/Screen";
import { previews } from "@/dev/previews";
import { t } from "@/i18n/t";
import { useTheme } from "@/theme/useTheme";

/** Dev-only list of UI previews (`src/dev/previews.tsx`); redirects home in release builds. */
export default function DevPreviewScreen() {
  const { colors, fontSize, spacing } = useTheme();
  const [open, setOpen] = useState<number | null>(null);
  if (!__DEV__) return <Redirect href="/" />;

  const row = { color: colors.accent, fontSize: fontSize.md, paddingVertical: spacing.sm };
  if (open !== null) {
    return (
      <Screen title={previews[open].title}>
        <Pressable onPress={() => setOpen(null)}>
          <Text style={row}>{t("dev.allPreviews")}</Text>
        </Pressable>
        {previews[open].render()}
      </Screen>
    );
  }
  return (
    <Screen title={t("dev.preview")}>
      {previews.map((p, i) => (
        <Pressable key={p.title} onPress={() => setOpen(i)}>
          <Text style={row}>{p.title}</Text>
        </Pressable>
      ))}
    </Screen>
  );
}
