import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { t, type MessageKey } from "@/i18n/t";
import type { Generation } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";

type Props = { generation: Generation; large?: boolean };

/** One generation: image (when done), prompt and status. */
export function GenerationCard({ generation, large }: Props) {
  const { colors, radius, spacing, fontSize } = useTheme();
  const statusKey = `status.${generation.status}` as MessageKey;
  return (
    <View
      testID={`generation-${generation.id}`}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm }]}
    >
      {generation.imageUrl ? (
        <Image
          source={{ uri: generation.imageUrl }}
          style={[large ? styles.large : styles.thumb, { borderRadius: radius.md, backgroundColor: colors.border }]}
          contentFit="cover"
          transition={200}
          accessibilityLabel={generation.input.prompt}
        />
      ) : null}
      <Text numberOfLines={large ? undefined : 2} style={{ color: colors.foreground, fontSize: fontSize.md }}>
        {generation.input.prompt}
      </Text>
      <Text style={{ color: generation.status === "failed" ? colors.danger : colors.muted, fontSize: fontSize.sm }}>{t(statusKey)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
  thumb: { width: "100%", aspectRatio: 16 / 9 },
  large: { width: "100%", aspectRatio: 1 },
});
