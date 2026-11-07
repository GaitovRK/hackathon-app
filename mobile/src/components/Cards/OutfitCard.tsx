import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlatLay } from "@/components/Items/FlatLay";
import { t } from "@/i18n/t";
import type { FeedbackValue, Outfit } from "@/services/api/types";
import { displayStyle, useTheme } from "@/theme/useTheme";

type Props = {
  outfit: Outfit;
  onWear?: () => void;
  onSave?: () => void;
  onFeedback?: (value: FeedbackValue) => void;
  feedback?: FeedbackValue | null;
  busy?: boolean;
  width?: number;
};

/** One suggested outfit (board `.cc`): sticker flat-lay, the one-line reason, and worn / save / like / dislike. */
export function OutfitCard({ outfit, onWear, onSave, onFeedback, feedback = null, busy = false, width }: Props) {
  const { colors, radius, spacing, fontSize, fontFamily, block } = useTheme();
  const action = (label: string, onPress: (() => void) | undefined, active = false, testID?: string) => (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled: busy || !onPress }}
      disabled={busy || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        { height: block.chipHeight, justifyContent: "center", borderRadius: radius.full, borderWidth: block.chipBorder, paddingHorizontal: spacing.md, borderColor: colors.border, backgroundColor: active ? colors.accentSoft : colors.surface },
        pressed && styles.dim,
      ]}
    >
      <Text style={{ color: colors.foreground, fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold }}>{label}</Text>
    </Pressable>
  );

  return (
    <View testID={`outfit-${outfit.id}`} style={{ width, paddingBottom: block.cardShadowOffset }}>
      <View style={[styles.shadow, { backgroundColor: colors.border, borderRadius: radius.card, top: block.cardShadowOffset }]} />
      <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: block.cardBorder, borderRadius: radius.card, padding: spacing.lg, gap: spacing.md }}>
        <FlatLay garments={outfit.items.map((i) => i.item)} />
        <Text style={displayStyle(fontSize.xl, colors.foreground)}>{outfit.reason}</Text>
        <Text style={{ color: colors.muted, fontSize: fontSize.xs, fontFamily: fontFamily.bodySemibold }}>{outfit.items.map((i) => i.item.name).join(" · ")}</Text>
        <View style={[styles.row, { gap: spacing.sm }]}>
          {action(outfit.status === "worn" ? t("today.worn") : t("today.wear"), onWear, outfit.status === "worn", `wear-${outfit.id}`)}
          {action(outfit.status === "saved" ? t("today.saved") : t("today.save"), onSave, outfit.status === "saved", `save-${outfit.id}`)}
          {action(t("today.like"), onFeedback ? () => onFeedback("like") : undefined, feedback === "like", `like-${outfit.id}`)}
          {action(t("today.dislike"), onFeedback ? () => onFeedback("dislike") : undefined, feedback === "dislike", `dislike-${outfit.id}`)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { position: "absolute", left: 0, right: 0, bottom: 0 },
  row: { flexDirection: "row", flexWrap: "wrap" },
  dim: { opacity: 0.7 },
});
