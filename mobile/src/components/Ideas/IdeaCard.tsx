import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { flatLaySlotsOf, flatLaySlotsOfLocked, OutfitFlatLay } from "@/components/Outfit/OutfitFlatLay";
import { LockBadge } from "@/components/Outfit/ProBadge";
import { t } from "@/i18n/t";
import type { Idea, LockedIdea } from "@/services/api/types";
import { useTheme } from "@/theme/useTheme";

function HeartIcon({ size, color, filled }: { size: number; color: string; filled: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"}>
      <Path d="M12 20.5 4.6 13.2a4.4 4.4 0 0 1 6.2-6.2L12 8.2l1.2-1.2a4.4 4.4 0 0 1 6.2 6.2Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

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
        style={[styles.card, { height, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: liked ? 2 : 1, borderColor: liked ? colors.border : colors.borderSoft }]}
      >
        <OutfitFlatLay slots={flatLaySlotsOf(idea.items)} width={Math.round(width * 0.62)} />
        <View style={[styles.badge, { top: spacing.sm, right: spacing.sm, width: 32, height: 32, borderRadius: radius.full, backgroundColor: liked ? colors.accentSoft : colors.surfaceAlt }]}>
          <HeartIcon size={18} color={colors.foreground} filled={liked} />
        </View>
      </Pressable>
      <Pressable testID={`idea-open-${idea.key}`} accessibilityRole="button" onPress={onOpen} style={[styles.caption, { gap: spacing.xs }]}>
        <Text numberOfLines={2} style={[styles.flex, { color: colors.foreground, fontSize: fontSize.sm, fontFamily: fontFamily.bodySemibold }]}>
          {idea.reason}
        </Text>
        <Text style={{ color: colors.muted, fontSize: fontSize.md }}>›</Text>
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
        style={[styles.card, { height, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft }]}
      >
        <OutfitFlatLay slots={flatLaySlotsOfLocked(idea.slots)} width={Math.round(width * 0.62)} ghost />
        <View style={styles.center} pointerEvents="none">
          <LockBadge />
        </View>
      </Pressable>
      <Text style={{ color: colors.muted, fontSize: fontSize.sm, fontFamily: fontFamily.bodySemibold, textAlign: "center" }}>{t("ideas.lockedCaption")}</Text>
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
