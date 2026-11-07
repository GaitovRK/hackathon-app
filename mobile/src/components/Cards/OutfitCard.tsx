import { StyleSheet, Text, View } from "react-native";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { IconButton } from "@/components/Buttons/IconButton";
import { Icon } from "@/components/Icons/Icon";
import { OutfitFlatLay } from "@/components/Outfit/OutfitFlatLay";
import { t } from "@/i18n/t";
import type { FeedbackValue, Outfit } from "@/services/api/types";
import { reasonStyle, useTheme } from "@/theme/useTheme";

type Props = {
  outfit: Outfit;
  onWear?: () => void;
  onSave?: () => void;
  onFeedback?: (value: FeedbackValue) => void;
  feedback?: FeedbackValue | null;
  busy?: boolean;
  width?: number;
  /** "01 · Work" pill on the card. */
  badge?: string;
};

/**
 * One suggested outfit (board `.ocard`): white card with a hairline, the layered flat-lay, a heart badge
 * (like, lilac when on), the italic serif reason line, then Wear today / Not for me / Save.
 */
export function OutfitCard({ outfit, onWear, onSave, onFeedback, feedback = null, busy = false, width = 256, badge }: Props) {
  const { colors, radius, spacing, fontSize, fontFamily, block } = useTheme();
  const liked = feedback === "like";
  const disliked = feedback === "dislike";
  const worn = outfit.status === "worn";
  const saved = outfit.status === "saved";

  return (
    <View testID={`outfit-${outfit.id}`} style={{ width, gap: spacing.sm + 2 }}>
      <View
        style={[
          styles.card,
          { height: Math.round(width * 1.24), borderRadius: radius.card - 2, backgroundColor: colors.paper, borderWidth: liked ? block.selectedBorder : block.cardBorder, borderColor: liked ? colors.ink : colors.line },
        ]}
      >
        {badge ? (
          <View style={[styles.pill, { left: spacing.md, top: spacing.md, backgroundColor: colors.mist, borderRadius: radius.full }]}>
            <Text style={{ color: colors.ink, fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold }}>{badge}</Text>
          </View>
        ) : null}
        <View style={[styles.badge, { right: spacing.md, top: spacing.md }]}>
          <IconButton
            testID={`like-${outfit.id}`}
            accessibilityLabel={t("today.like")}
            tone={liked ? "lilac" : "line"}
            size={32}
            selected={liked}
            disabled={busy}
            onPress={onFeedback ? () => onFeedback("like") : undefined}
            icon={<Icon name="heart" size={16} filled={liked} />}
          />
        </View>
        <OutfitFlatLay garments={outfit.items.map((i) => i.item)} width={Math.round(width * 0.62)} />
      </View>
      <Text style={reasonStyle(fontSize.xl, colors.ink)}>{outfit.reason}</Text>
      <Text numberOfLines={1} style={{ color: colors.ink2, fontSize: fontSize.xs, fontFamily: fontFamily.body }}>
        {outfit.items.map((i) => i.item.name).join(" · ")}
      </Text>
      <View style={[styles.row, { gap: spacing.sm }]}>
        <View style={styles.flex}>
          <ButtonPrimary testID={`wear-${outfit.id}`} small label={worn ? t("today.worn") : t("home.wearToday")} onPress={() => onWear?.()} disabled={busy || !onWear || worn} />
        </View>
        <IconButton
          testID={`dislike-${outfit.id}`}
          accessibilityLabel={t("today.dislike")}
          size={40}
          tone={disliked ? "ink" : "mist"}
          selected={disliked}
          disabled={busy}
          onPress={onFeedback ? () => onFeedback("dislike") : undefined}
          icon={<Icon name="thumb" size={18} rotate={180} color={disliked ? colors.paper : colors.ink} />}
        />
        <IconButton
          testID={`save-${outfit.id}`}
          accessibilityLabel={saved ? t("today.saved") : t("today.save")}
          size={40}
          tone={saved ? "lilac" : "mist"}
          selected={saved}
          disabled={busy}
          onPress={onSave}
          icon={<Icon name="bookmark" size={18} filled={saved} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  pill: { position: "absolute", height: 26, paddingHorizontal: 10, justifyContent: "center", zIndex: 9 },
  badge: { position: "absolute", zIndex: 9 },
  row: { flexDirection: "row", alignItems: "center" },
  flex: { flex: 1 },
});
