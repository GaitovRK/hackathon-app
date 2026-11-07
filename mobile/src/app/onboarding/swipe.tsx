import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconButton } from "@/components/Buttons/IconButton";
import { LookCard } from "@/components/Cards/LookCard";
import { Icon } from "@/components/Icons/Icon";
import { Screen } from "@/components/Layout/Screen";
import { SegmentedProgress } from "@/components/Status/SegmentedProgress";
import { looksFor } from "@/content/looks";
import { t } from "@/i18n/t";
import { useAppDispatch, useAppSelector } from "@/store";
import { lookSwiped, stepChanged } from "@/store/onboardingSlice";
import { displayStyle, useTheme } from "@/theme/useTheme";

/** The swipe deck (board screen 01): back / "7 / 20" / Skip, the segmented bar, a serif question, the look card, then Not for me / Very me. */
export default function SwipeScreen() {
  const { spacing, colors, fontSize, fontFamily, radius } = useTheme();
  const dispatch = useAppDispatch();
  const { deckIndex, wardrobe } = useAppSelector((s) => s.onboarding);
  const deck = useMemo(() => looksFor(wardrobe), [wardrobe]);
  const look = deck[deckIndex];
  const done = !look;
  const shown = Math.min(deckIndex + 1, deck.length);

  useEffect(() => {
    if (done) {
      dispatch(stepChanged("questions"));
      router.replace("/onboarding/questions");
    }
  }, [dispatch, done]);

  const swipe = (liked: boolean) => {
    if (look) dispatch(lookSwiped({ lookId: look.id, liked }));
  };

  return (
    <Screen scroll={false}>
      <View style={styles.between}>
        <IconButton accessibilityLabel={t("onboarding.back")} onPress={() => router.back()} icon={<Icon name="back" />} />
        <Text testID="swipe-counter" style={{ color: colors.ink, fontSize: fontSize.md, fontFamily: fontFamily.bodyBold }}>
          {t("onboarding.counter", { index: shown, total: deck.length })}
        </Text>
        <Pressable testID="swipe-skip" accessibilityRole="button" onPress={() => router.replace("/onboarding/questions")} style={styles.skip}>
          <Text style={{ color: colors.ink2, fontSize: fontSize.md, fontFamily: fontFamily.bodySemibold }}>{t("common.skip")}</Text>
        </Pressable>
      </View>
      <SegmentedProgress testID="swipe-progress" index={Math.min(deckIndex, deck.length)} total={deck.length} />
      <View style={{ gap: spacing.sm }}>
        <Text style={displayStyle(fontSize.display, colors.ink)}>{t("onboarding.swipeQuestion")}</Text>
        <Text style={{ color: colors.ink2, fontSize: fontSize.md, fontFamily: fontFamily.body, lineHeight: 21 }}>
          {t("onboarding.swipeSub", { left: Math.max(0, deck.length - shown) })}
        </Text>
      </View>
      <View style={styles.center}>
        {look ? (
          <View>
            <LookCard look={look} width={250} />
            <View style={[styles.stamp, { backgroundColor: colors.lilac, borderRadius: radius.full }]}>
              <Icon name="heart" size={13} filled />
              <Text style={{ color: colors.ink, fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold }}>{t("onboarding.veryMe")}</Text>
            </View>
          </View>
        ) : (
          <Text style={{ color: colors.ink2, fontSize: fontSize.md, fontFamily: fontFamily.body }}>{t("onboarding.swipeDone")}</Text>
        )}
      </View>
      <View style={[styles.actions, { gap: spacing.xl }]}>
        <IconButton testID="swipe-dislike" accessibilityLabel={t("onboarding.notForMe")} tone="line" size={64} disabled={done} onPress={() => swipe(false)} icon={<Icon name="x" size={26} />} />
        <IconButton testID="swipe-like" accessibilityLabel={t("onboarding.veryMe")} tone="ink" size={64} disabled={done} onPress={() => swipe(true)} icon={<Icon name="heart" size={26} color={colors.paper} filled />} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  skip: { width: 44, alignItems: "flex-end" },
  center: { alignItems: "center" },
  stamp: { position: "absolute", left: 14, top: 14, flexDirection: "row", alignItems: "center", gap: 5, height: 26, paddingHorizontal: 10 },
  actions: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
});
