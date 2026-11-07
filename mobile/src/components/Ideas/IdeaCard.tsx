import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/Icons/Icon";
import type { TileGarment } from "@/components/Items/ItemTile";
import { OutfitFlatLay } from "@/components/Outfit/OutfitFlatLay";
import { LockBadge } from "@/components/Outfit/ProBadge";
import { t } from "@/i18n/t";
import type { Idea, LockedIdea } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";

/** A locked idea only carries shapes; the flat-lay draws them as grey silhouettes (`ghost`). */
export const lockedGarments = (idea: LockedIdea): TileGarment[] => idea.slots.map((s) => ({ name: s.subcategory, category: s.category, subcategory: s.subcategory, primaryColor: "grey" }));

type IdeaProps = { idea: Idea; liked: boolean; width: number; onToggle: () => void; onOpen: () => void };

/** One idea in the grid (board `.ocard`): the flat-lay, a heart badge to like it, the reason as the caption. Liked = ink outline + lilac heart. */
export function IdeaCard({ idea, liked, width, onToggle, onOpen }: IdeaProps) {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  const height = Math.round(width * 1.16);
  return (
    <View style={{ width, gap: spacing.sm }}>
      <Pressable
        testID={`idea-${idea.key}`}
        accessibilityRole="button"
        accessibilityLabel={idea.reason}
        accessibilityState={{ selected: liked }}
        onPress={onToggle}
        style={[styles.card, { height, borderRadius: radius.card, backgroundColor: colors.paper, borderWidth: liked ? 2 : 1, borderColor: liked ? colors.ink : colors.line }]}
      >
        <OutfitFlatLay garments={idea.items.map((i) => i.item)} width={Math.round(width * 0.62)} />
        <View style={[styles.badge, { top: spacing.sm, right: spacing.sm, width: 32, height: 32, borderRadius: radius.full, backgroundColor: liked ? colors.lilac : colors.mist }]}>
          <Icon name="heart" size={18} filled={liked} />
        </View>
      </Pressable>
      <Pressable testID={`idea-open-${idea.key}`} accessibilityRole="button" onPress={onOpen} style={[styles.caption, { gap: spacing.xs }]}>
        <Text numberOfLines={2} style={[styles.flex, { color: colors.ink, fontSize: fontSize.sm, fontFamily: fontFamily.bodySemibold }]}>
          {idea.reason}
        </Text>
        <Icon name="chev" size={16} color={colors.ink3} />
      </Pressable>
    </View>
  );
}

type LockedProps = { idea: LockedIdea; width: number; onPress: () => void };

/** A Pro-only idea: the same stack as a grey silhouette with an ink lock, "Unlock with Pro" under it. Tapping opens the paywall. */
export function LockedIdeaCard({ idea, width, onPress }: LockedProps) {
  const { colors, radius, spacing, fontSize, fontFamily } = useTheme();
  const height = Math.round(width * 1.16);
  return (
    <View style={{ width, gap: spacing.sm }}>
      <Pressable
        testID={`locked-${idea.key}`}
        accessibilityRole="button"
        accessibilityLabel={t("ideas.lockedCaption")}
        onPress={onPress}
        style={[styles.card, { height, borderRadius: radius.card, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }]}
      >
        <OutfitFlatLay garments={lockedGarments(idea)} width={Math.round(width * 0.62)} ghost />
        <View style={styles.center} pointerEvents="none">
          <LockBadge />
        </View>
      </Pressable>
      <Text style={{ color: colors.ink3, fontSize: fontSize.sm, fontFamily: fontFamily.bodySemibold, textAlign: "center" }}>{t("ideas.lockedCaption")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  badge: { position: "absolute", alignItems: "center", justifyContent: "center" },
  caption: { flexDirection: "row", alignItems: "center" },
  center: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
});
